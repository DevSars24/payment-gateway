import express from "express";
import cors from "cors";
import helmet from "helmet";
import { globalRateLimiter } from "./src/middleware/rateLimiter.js";
import { requestLogger } from "./src/middleware/requestLogger.js";
import { globalErrorHandler } from "./src/middleware/errorHandler.js";
import { NotFoundError } from "./src/utils/AppError.js";
import { envConfig } from "./src/config/env.js";

// Import Routers
import paymentRoutes from "./src/routes/paymentRoute.js";
import webhookRoutes from "./src/routes/webhookRoute.js";
import healthRoutes from "./src/routes/healthRoute.js";

const app = express();

// 1. Security HTTP Headers
app.use(helmet());

// 2. Cross-Origin Resource Sharing (CORS)
app.use(
  cors({
    origin: envConfig.CLIENT_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Correlation-ID"],
  })
);

// 3. Request Tracing & Performance Logger
app.use(requestLogger);

// 4. Global Rate Limiter
app.use(globalRateLimiter);

// 5. JSON Body Parser with Raw Body Preservation for Webhook Verification
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: true }));

// 6. Mount Routers
app.use("/api", healthRoutes);
app.use("/api/webhook", webhookRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api", paymentRoutes); // Retain backward-compatible /api/checkout endpoints

// 7. Handle Unmatched 404 Routes
app.all("*", (req, res, next) => {
  next(new NotFoundError(`Cannot find endpoint ${req.originalUrl} on this server`));
});

// 8. Centralized Global Error Handler Middleware
app.use(globalErrorHandler);

export default app;