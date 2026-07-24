/**
 * Custom Operational Error Class for standardized application errors.
 * Distinguishes operational errors (predictable client/business logic errors)
 * from programmatic runtime crashes.
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad Request", details = null) {
    super(message, 400, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", details = null) {
    super(message, 401, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource Not Found", details = null) {
    super(message, 404, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict Occurred", details = null) {
    super(message, 409, details);
  }
}

export class PaymentVerificationError extends AppError {
  constructor(message = "Payment Signature Verification Failed", details = null) {
    super(message, 400, details);
  }
}

export class InternalServerError extends AppError {
  constructor(message = "Internal Server Error", details = null) {
    super(message, 500, details);
  }
}
