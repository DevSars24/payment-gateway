import express from "express";
import { checkout, getKey, paymentVerification, getProducts, getPayments, logError } from "../controllers/paymentController.js";

const router = express.Router();

// Get Razorpay API key
router.route("/getkey").get(getKey);

// Create a Razorpay order for checkout
router.route("/checkout").post(checkout);

// Verify payment after Razorpay transaction
router.route("/paymentverification").post(paymentVerification);

// Fetch product list for the store
router.route("/products").get(getProducts);

// Retrieve payment history
router.route("/payments").get(getPayments);

// Log client-side errors
router.route("/log-error").post(logError);

export default router;