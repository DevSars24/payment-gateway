import rateLimit from "express-rate-limit";

/**
 * Standard Rate Limiter for general public routes (100 requests per 15 minutes).
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: "Too many requests from this IP, please try again after 15 minutes.",
  },
});

/**
 * Strict Rate Limiter for sensitive payment routes (20 requests per 15 minutes).
 */
export const paymentRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: "Payment attempt rate limit exceeded. Please try again later.",
  },
});
