import { BadRequestError } from "../utils/AppError.js";

/**
 * Express Schema Validation Middleware.
 * Higher-order function validating req.body against rule object.
 * 
 * @param {Object} rules - Field validation constraints
 */
export const validateBody = (rules) => {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rule] of Object.entries(rules)) {
      const value = req.body ? req.body[field] : undefined;

      if (rule.required && (value === undefined || value === null || value === "")) {
        errors.push(`Field '${field}' is required.`);
        continue;
      }

      if (value !== undefined && value !== null) {
        if (rule.type === "number" && (typeof value !== "number" || isNaN(value))) {
          errors.push(`Field '${field}' must be a valid number.`);
        }
        if (rule.type === "string" && typeof value !== "string") {
          errors.push(`Field '${field}' must be a string.`);
        }
        if (rule.min !== undefined && value < rule.min) {
          errors.push(`Field '${field}' must be greater than or equal to ${rule.min}.`);
        }
      }
    }

    if (errors.length > 0) {
      return next(new BadRequestError("Validation failed", errors));
    }

    next();
  };
};
