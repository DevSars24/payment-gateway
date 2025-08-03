import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  razorpayOrderId: {
    type: String,
    required: true,
  },
  razorpayPaymentId: {
    type: String,
    required: false, // Make optional, as it's set during payment verification
  },
  razorpaySignature: {
    type: String,
    required: false, // Make optional, as it's set during payment verification
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["created", "completed", "failed"],
    default: "created",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Payment", paymentSchema);