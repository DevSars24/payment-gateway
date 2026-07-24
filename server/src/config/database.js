import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

/**
 * Resilient Database Connection Manager handling connection pool options,
 * disconnect re-attempts, event logging, and graceful termination.
 */
class DatabaseConnection {
  constructor() {
    this.isConnected = false;
  }

  async connect(uri) {
    if (this.isConnected) {
      logger.info("Database connection already established.");
      return;
    }

    const options = {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    // Attach listeners before connecting
    mongoose.connection.on("connected", () => {
      this.isConnected = true;
      logger.info("✅ MongoDB connection successfully established.");
    });

    mongoose.connection.on("error", (err) => {
      logger.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      this.isConnected = false;
      logger.warn("⚠️ MongoDB disconnected. Attempting to reconnect...");
    });

    try {
      await mongoose.connect(uri, options);
    } catch (error) {
      logger.error("❌ Fatal Error connecting to MongoDB:", error);
      process.exit(1);
    }
  }

  async disconnect() {
    if (!this.isConnected) return;
    try {
      await mongoose.connection.close();
      this.isConnected = false;
      logger.info("MongoDB connection closed cleanly.");
    } catch (error) {
      logger.error("Error closing MongoDB connection:", error);
    }
  }
}

export const dbConnection = new DatabaseConnection();
export const connectDB = (uri) => dbConnection.connect(uri || process.env.MONGO_URI);
export default connectDB;
