import { getRazorpayInstance } from "../config/razorpay.js";
import { envConfig } from "../config/env.js";
import { paymentRepository } from "../repositories/paymentRepository.js";
import { CryptoUtils } from "../utils/cryptoUtils.js";
import { BadRequestError, NotFoundError, PaymentVerificationError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

/**
 * Service Layer: Payment Business Logic Orchestrator.
 * Connects controller requests with external Razorpay SDK and database storage.
 */
export class PaymentService {
  /**
   * Returns public Razorpay Key ID
   */
  getPublicApiKey() {
    if (!envConfig.RAZORPAY_KEY_ID) {
      throw new BadRequestError("Razorpay Key ID is not configured on the server.");
    }
    return { key: envConfig.RAZORPAY_KEY_ID };
  }

  /**
   * Create Razorpay Order and persist initial transaction in DB
   * @param {number} amount - Amount in INR
   * @param {string} currency - Currency code (default INR)
   */
  async createCheckoutOrder(amount, currency = "INR") {
    if (!amount || isNaN(amount) || amount < 1) {
      throw new BadRequestError("Invalid checkout amount. Amount must be a valid number >= 1 INR.");
    }

    const razorpay = getRazorpayInstance();
    const receiptId = `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const options = {
      amount: Math.round(amount * 100), // Razorpay accepts amount in sub-units (paise)
      currency,
      receipt: receiptId,
    };

    logger.info(`Initiating Razorpay order creation for amount: ${amount} ${currency}`);
    const order = await razorpay.orders.create(options);

    // Save initial transaction state in DB
    const paymentRecord = await paymentRepository.create({
      razorpayOrderId: order.id,
      amount,
      currency,
      receipt: receiptId,
      status: "created",
    });

    logger.info(`Checkout order created successfully. Order ID: ${order.id}`);
    return { order, paymentId: paymentRecord._id };
  }

  /**
   * Verify Razorpay Payment Signature and update transaction status
   */
  async verifyPayment(orderId, paymentId, signature) {
    if (!orderId || !paymentId || !signature) {
      throw new BadRequestError("Missing required payment verification credentials.");
    }

    const secret = envConfig.RAZORPAY_KEY_SECRET;
    const isValid = CryptoUtils.verifyPaymentSignature(orderId, paymentId, signature, secret);

    const paymentRecord = await paymentRepository.findByOrderId(orderId);

    if (!isValid) {
      logger.warn(`Payment signature verification failed for Order ID: ${orderId}`);
      if (paymentRecord) {
        await paymentRepository.updateStatus(orderId, {
          status: "failed",
          failureReason: "Invalid HMAC signature",
        });
      }
      throw new PaymentVerificationError("Invalid cryptographic payment signature.");
    }

    logger.info(`Payment signature verified successfully for Order ID: ${orderId}`);

    const updatedPayment = await paymentRepository.updateStatus(orderId, {
      razorpayPaymentId: paymentId,
      razorpaySignature: signature,
      status: "completed",
    });

    return {
      success: true,
      paymentId,
      orderId,
      status: "completed",
      updatedRecord: updatedPayment,
    };
  }

  /**
   * Retrieve payment transaction logs with pagination
   */
  async getPaymentHistory(page = 1, limit = 20) {
    return await paymentRepository.findAll(page, limit);
  }
}

export const paymentService = new PaymentService();
