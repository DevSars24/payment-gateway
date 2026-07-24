import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    razorpayOrderId: {
      type: String,
      required: [true, "Razorpay Order ID is required"],
      unique: true,
      index: true,
      trim: true,
    },
    razorpayPaymentId: {
      type: String,
      required: false,
      index: true,
      trim: true,
    },
    razorpaySignature: {
      type: String,
      required: false,
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: [1, "Amount must be at least 1 INR"],
    },
    currency: {
      type: String,
      required: true,
      default: "INR",
      uppercase: true,
    },
    status: {
      type: String,
      enum: ["created", "processing", "completed", "failed", "refunded"],
      default: "created",
      index: true,
    },
    receipt: {
      type: String,
      required: false,
    },
    notes: {
      type: Map,
      of: String,
      default: {},
    },
    failureReason: {
      type: String,
      required: false,
    },
    webhookEvents: [
      {
        eventId: String,
        eventType: String,
        processedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Compound Index for high performance query sorting
paymentSchema.index({ status: 1, createdAt: -1 });

// Instance Method: Mark payment as completed
paymentSchema.methods.markCompleted = function (paymentId, signature) {
  this.razorpayPaymentId = paymentId;
  this.razorpaySignature = signature;
  this.status = "completed";
  return this.save();
};

// Instance Method: Mark payment as failed
paymentSchema.methods.markFailed = function (reason = "Signature verification failed") {
  this.status = "failed";
  this.failureReason = reason;
  return this.save();
};

export const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
export default Payment;
