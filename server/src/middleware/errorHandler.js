import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/**
 * Global Error Handling Middleware.
 * Catches all errors emitted via next(error) or thrown in async handlers.
 * Sanitizes errors and returns standardized JSON responses.
 */
export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  const correlationId = req.correlationId || "N/A";

  // Log error using structured logger
  logger.error(`Error processing ${req.method} ${req.originalUrl}`, err, { correlationId });

  // Handle specific Mongoose validation or cast errors
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((el) => el.message).join(", ");
    return ApiResponse.error(res, 400, `Invalid input data: ${message}`);
  }

  if (err.name === "CastError") {
    return ApiResponse.error(res, 400, `Invalid ${err.path}: ${err.value}`);
  }

  if (err.code === 11000) {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    return ApiResponse.error(res, 409, `Duplicate field value: ${value}. Please use another value!`);
  }

  // Handle Operational Errors (AppError instances)
  if (err.isOperational) {
    return ApiResponse.error(res, err.statusCode, err.message, err.details);
  }

  // Handle Unknown / Programmatic Errors (Don't leak stack traces in production)
  const isProduction = process.env.NODE_ENV === "production";
  const responseMessage = isProduction ? "Internal server error" : err.message;
  const responseDetails = isProduction ? null : err.stack;

  return ApiResponse.error(res, 500, responseMessage, responseDetails);
};
