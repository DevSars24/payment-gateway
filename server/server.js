import { envConfig } from "./src/config/env.js";
import { connectDB, dbConnection } from "./src/config/database.js";
import { logger } from "./src/utils/logger.js";
import app from "./app.js";

// Handle Synchronous Uncaught Exceptions
process.on("uncaughtException", (err) => {
  logger.error("💥 UNCAUGHT EXCEPTION! Shutting down immediately...", err);
  process.exit(1);
});

// Connect to Database
connectDB(envConfig.MONGO_URI);

// Start HTTP Server Listener
const PORT = envConfig.PORT || 4000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server initialized on port ${PORT} in [${envConfig.NODE_ENV}] mode`);
});

// Handle Asynchronous Unhandled Promise Rejections
process.on("unhandledRejection", (err) => {
  logger.error("💥 UNHANDLED REJECTION! Gracefully terminating server...", err);
  server.close(() => {
    process.exit(1);
  });
});

// Graceful Shutdown Handlers (SIGTERM / SIGINT)
const gracefulShutdown = (signal) => {
  logger.warn(`⚠️ Received ${signal} signal. Initiating graceful shutdown...`);
  server.close(async () => {
    logger.info("HTTP server closed.");
    await dbConnection.disconnect();
    process.exit(0);
  });

  // Force shutdown if cleanup takes longer than 10 seconds
  setTimeout(() => {
    logger.error("Could not close connections in time, forcing process exit.");
    process.exit(1);
  }, 10000).unref();
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
