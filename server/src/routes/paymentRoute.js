import express from "express";
import {
  getKey,
  checkout,
  paymentVerification,
  getProducts,
  getPayments,
  logError,
} from "../controllers/paymentController.js";
import { validateBody } from "../middleware/requestValidator.js";
import { paymentRateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Get Razorpay API key
router.route("/getkey").get(getKey);

// Create a Razorpay order for checkout (Rate limited + Body validated)
router.route("/checkout").post(
  paymentRateLimiter,
  validateBody({
    amount: { required: true, type: "number", min: 1 },
  }),
  checkout
);

// Verify payment after Razorpay transaction (Rate limited + Body validated)
router.route("/paymentverification").post(
  paymentRateLimiter,
  validateBody({
    razorpay_order_id: { required: true, type: "string" },
    razorpay_payment_id: { required: true, type: "string" },
    razorpay_signature: { required: true, type: "string" },
  }),
  paymentVerification
);

// Fetch product list for the store
router.route("/products").get(getProducts);

// Retrieve payment history
router.route("/payments").get(getPayments);

// Log client-side errors
router.route("/log-error").post(logError);

export default router;
