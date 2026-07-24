import express from "express";
import { handleWebhook } from "../controllers/webhookController.js";

const router = express.Router();

// Webhook endpoint
router.post("/razorpay", handleWebhook);

export default router;
