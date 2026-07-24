import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { paymentService } from "../services/paymentService.js";
import { productService } from "../services/productService.js";
import { logger } from "../utils/logger.js";

/**
 * Controller: Payment HTTP Handlers.
 */

// Get Razorpay Key ID
export const getKey = asyncHandler(async (req, res) => {
  const result = paymentService.getPublicApiKey();
  return ApiResponse.success(res, 200, "Razorpay API key fetched successfully", result);
});

// Checkout / Create Razorpay Order
export const checkout = asyncHandler(async (req, res) => {
  const { amount, currency } = req.body;
  const result = await paymentService.createCheckoutOrder(amount, currency);
  return ApiResponse.success(res, 200, "Payment order created successfully", result);
});

// Verify Payment Signature
export const paymentVerification = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const result = await paymentService.verifyPayment(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );
  return ApiResponse.success(res, 200, "Payment signature verified successfully", result);
});

// Fetch Product Catalog
export const getProducts = asyncHandler(async (req, res) => {
  const products = await productService.getProducts();
  return ApiResponse.success(res, 200, "Products retrieved successfully", products);
});

// Get Payment History
export const getPayments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const result = await paymentService.getPaymentHistory(page, limit);
  return ApiResponse.success(res, 200, "Payment history fetched successfully", result.payments, result.pagination);
});

// Log Client Errors
export const logError = asyncHandler(async (req, res) => {
  logger.warn("Client side error log received:", req.body);
  return ApiResponse.success(res, 200, "Client error logged successfully");
});
