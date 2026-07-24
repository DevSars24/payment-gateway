import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { webhookService } from "../services/webhookService.js";

/**
 * Controller: Razorpay Webhook HTTP Handler.
 */
export const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const rawBody = req.rawBody || JSON.stringify(req.body);

  const result = await webhookService.processWebhookEvent(rawBody, signature, req.body);
  return ApiResponse.success(res, 200, "Webhook processed successfully", result);
});
