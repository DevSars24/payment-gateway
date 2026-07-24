import { envConfig } from "../config/env.js";
import { CryptoUtils } from "../utils/cryptoUtils.js";
import { paymentRepository } from "../repositories/paymentRepository.js";
import { BadRequestError, PaymentVerificationError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

/**
 * Webhook Service: Asynchronous Razorpay Event Processor.
 * Verifies webhook signatures and handles events (`payment.captured`, `payment.failed`, `order.paid`).
 */
export class WebhookService {
  /**
   * Process incoming Razorpay webhook payload safely and idempotently
   * @param {Buffer|string} rawBody - Raw unparsed HTTP payload
   * @param {string} signature - Header x-razorpay-signature
   * @param {Object} eventPayload - Parsed webhook event JSON
   */
  async processWebhookEvent(rawBody, signature, eventPayload) {
    if (!signature) {
      throw new BadRequestError("Missing x-razorpay-signature header in webhook request.");
    }

    const webhookSecret = envConfig.RAZORPAY_WEBHOOK_SECRET;
    const isValid = CryptoUtils.verifyWebhookSignature(rawBody, signature, webhookSecret);

    if (!isValid) {
      logger.error("Webhook signature verification failed.");
      throw new PaymentVerificationError("Invalid webhook signature.");
    }

    const { event, payload } = eventPayload;
    const eventId = eventPayload.event_id || `evt_${Date.now()}`;

    logger.info(`Received verified Webhook event: ${event} [ID: ${eventId}]`);

    switch (event) {
      case "payment.captured":
      case "order.paid":
        await this.handlePaymentSuccess(payload, eventId, event);
        break;

      case "payment.failed":
        await this.handlePaymentFailure(payload, eventId, event);
        break;

      default:
        logger.info(`Unhandled Webhook event type: ${event}`);
        break;
    }

    return { processed: true, event };
  }

  async handlePaymentSuccess(payload, eventId, eventType) {
    const entity = payload.payment ? payload.payment.entity : payload.order.entity;
    const orderId = entity.order_id || entity.id;
    const paymentId = entity.id;

    logger.info(`Webhook Processing: Payment Success for Order ${orderId}`);

    // Idempotent recording
    await paymentRepository.recordWebhookEvent(orderId, eventId, eventType);
    await paymentRepository.updateStatus(orderId, {
      razorpayPaymentId: paymentId,
      status: "completed",
    });
  }

  async handlePaymentFailure(payload, eventId, eventType) {
    const entity = payload.payment.entity;
    const orderId = entity.order_id;

    logger.warn(`Webhook Processing: Payment Failed for Order ${orderId}`);

    await paymentRepository.recordWebhookEvent(orderId, eventId, eventType);
    await paymentRepository.updateStatus(orderId, {
      status: "failed",
      failureReason: entity.error_description || "Payment failed at gateway",
    });
  }
}

export const webhookService = new WebhookService();
