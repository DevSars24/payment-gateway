import Razorpay from "razorpay";
import { envConfig } from "./env.js";
import { logger } from "../utils/logger.js";
import { InternalServerError } from "../utils/AppError.js";

/**
 * Razorpay SDK Client Factory Singleton.
 */
let razorpayInstance = null;

export const getRazorpayInstance = () => {
  if (razorpayInstance) return razorpayInstance;

  const key_id = envConfig.RAZORPAY_KEY_ID;
  const key_secret = envConfig.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    logger.error("Razorpay SDK initialization failed: Credentials not configured.");
    throw new InternalServerError("Razorpay API key or secret is missing.");
  }

  razorpayInstance = new Razorpay({ key_id, key_secret });
  logger.info("Razorpay client initialized successfully.");
  return razorpayInstance;
};
