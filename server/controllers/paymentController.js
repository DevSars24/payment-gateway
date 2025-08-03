import dotenv from "dotenv";
dotenv.config({ path: "./config/config.env" });
import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/paymentModel.js";

let razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const getKey = (req, res) => {
  try {
    res.status(200).json({ key: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error("Error in getKey:", error.message);
    res.status(500).json({ error: "Failed to fetch key", details: error.message });
  }
};

export const checkout = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || isNaN(amount) || amount < 1) {
      return res.status(400).json({ error: "Invalid amount", details: "Amount must be a valid number >= 1 INR" });
    }
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    const payment = new Payment({
      razorpayOrderId: order.id,
      amount: amount,
      currency: "INR",
    });
    await payment.save();
    res.status(200).json({ order });
  } catch (error) {
    console.error("Error in checkout:", error.message);
    res.status(500).json({ error: "Failed to create order", details: error.message });
  }
};

export const paymentVerification = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");
    if (expectedSignature === razorpay_signature) {
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          status: "completed",
        },
        { new: true }
      );
      res.status(200).json({
        success: true,
        payment_id: razorpay_payment_id,
      });
    } else {
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: "failed" }
      );
      res.status(400).json({ error: "Invalid signature" });
    }
  } catch (error) {
    console.error("Error in paymentVerification:", error.message);
    res.status(500).json({ error: "Payment verification failed", details: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = [
      {
        id: 1,
        name: "MacBook Pro",
        amount: 5000,
        img: "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp-spacegray-select-202206?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1664497359481",
        description: "13-inch, M2 Chip, 8GB RAM",
      },
      {
        id: 2,
        name: "Canon EOS R5",
        amount: 3000,
        img: "https://www.bhphotovideo.com/images/images2500x2500/canon_eos_r5_mirrorless_digital_1531228.jpg",
        description: "45MP Full-Frame Mirrorless Camera",
      },
    ];
    res.status(200).json(products);
  } catch (error) {
    console.error("Error in getProducts:", error.message);
    res.status(500).json({ error: "Failed to fetch products", details: error.message });
  }
};

export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.status(200).json(payments);
  } catch (error) {
    console.error("Error in getPayments:", error.message);
    res.status(500).json({ error: "Failed to fetch payments", details: error.message });
  }
};

export const logError = async (req, res) => {
  try {
    console.log("POST /api/log-error called with body:", req.body);
    res.status(200).json({ success: true, message: "Error logged" });
  } catch (error) {
    console.error("Error in logError:", error.message);
    res.status(500).json({ error: "Failed to log error", details: error.message });
  }
};