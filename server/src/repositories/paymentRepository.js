import Payment from "../models/paymentModel.js";

/**
 * Repository Pattern: Payment Data Access Object (DAO).
 * Encapsulates raw database queries and decouples DB technology from business domain logic.
 */
export class PaymentRepository {
  /**
   * Create a new payment record in DB
   */
  async create(paymentData) {
    return await Payment.create(paymentData);
  }

  /**
   * Find payment record by Razorpay Order ID
   */
  async findByOrderId(razorpayOrderId) {
    return await Payment.findOne({ razorpayOrderId });
  }

  /**
   * Find payment record by Razorpay Payment ID
   */
  async findByPaymentId(razorpayPaymentId) {
    return await Payment.findOne({ razorpayPaymentId });
  }

  /**
   * Update payment status and payment details
   */
  async updateStatus(razorpayOrderId, updateFields) {
    return await Payment.findOneAndUpdate({ razorpayOrderId }, updateFields, {
      new: true,
      runValidators: true,
    });
  }

  /**
   * Get payment transaction history with pagination
   */
  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const payments = await Payment.find().sort({ createdAt: -1 }).skip(skip).limit(limit);

    const total = await Payment.countDocuments();
    return {
      payments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Record Webhook Event Execution for Idempotency
   */
  async recordWebhookEvent(razorpayOrderId, eventId, eventType) {
    return await Payment.findOneAndUpdate(
      { razorpayOrderId, "webhookEvents.eventId": { $ne: eventId } },
      {
        $push: {
          webhookEvents: { eventId, eventType, processedAt: new Date() },
        },
      },
      { new: true }
    );
  }
}

export const paymentRepository = new PaymentRepository();
