import crypto from "crypto";
import { logger } from "../utils/logger.js";

/**
 * Request Correlation & Performance Logging Middleware.
 * Attaches a unique Correlation ID to every incoming request and tracks execution time.
 */
export const requestLogger = (req, res, next) => {
  const correlationId = req.headers["x-correlation-id"] || crypto.randomUUID();
  req.correlationId = correlationId;
  res.setHeader("X-Correlation-ID", correlationId);

  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? "warn" : "info";

    logger[logLevel](`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`, {
      correlationId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: duration,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    });
  });

  next();
};
