import dotenv from "dotenv";
import path from "path";
import { logger } from "../utils/logger.js";

// Load environment variables from config file
dotenv.config({ path: "./config/config.env" });

/**
 * Validates and exposes sanitized environment variables.
 */
class EnvironmentConfig {
  constructor() {
    this.PORT = process.env.PORT || 4000;
    this.NODE_ENV = process.env.NODE_ENV || "development";
    this.MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/payment_gateway";
    this.RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
    this.RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
    this.RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "default_webhook_secret";
    this.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

    this.validate();
  }

  validate() {
    const requiredVars = ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"];
    const missing = requiredVars.filter((key) => !process.env[key]);

    if (missing.length > 0) {
      logger.warn(`⚠️ Missing recommended environment variables: ${missing.join(", ")}`);
    }
  }
}

export const envConfig = new EnvironmentConfig();
