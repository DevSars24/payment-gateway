import crypto from "crypto";

/**
 * Cryptographic Utility for HMAC Signature Generation and Timing-Safe Verification.
 * Prevents side-channel timing attacks when checking payment/webhook signatures.
 */
export class CryptoUtils {
  /**
   * Generates HMAC-SHA256 signature for given data string and secret key.
   * @param {string} data - Payload string (e.g. order_id|payment_id)
   * @param {string} secret - Secret key
   * @returns {string} Hex encoded signature
   */
  static generateHmacSha256(data, secret) {
    return crypto.createHmac("sha256", secret).update(data).digest("hex");
  }

  /**
   * Performs constant-time / timing-safe string comparison between generated and target signature.
   * @param {string} signatureA - First signature string
   * @param {string} signatureB - Second signature string
   * @returns {boolean} True if signatures match identically
   */
  static verifyTimingSafe(signatureA, signatureB) {
    if (!signatureA || !signatureB) return false;
    const bufA = Buffer.from(signatureA, "utf-8");
    const bufB = Buffer.from(signatureB, "utf-8");

    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  }

  /**
   * Verify Razorpay Payment Signature
   * @param {string} orderId - Razorpay Order ID
   * @param {string} paymentId - Razorpay Payment ID
   * @param {string} signature - Received Signature
   * @param {string} secret - Razorpay Key Secret
   * @returns {boolean}
   */
  static verifyPaymentSignature(orderId, paymentId, signature, secret) {
    const payload = `${orderId}|${paymentId}`;
    const expected = this.generateHmacSha256(payload, secret);
    return this.verifyTimingSafe(expected, signature);
  }

  /**
   * Verify Razorpay Webhook Signature
   * @param {string|Buffer} rawBody - Raw HTTP Request body
   * @param {string} signature - Received Webhook Signature (x-razorpay-signature header)
   * @param {string} secret - Webhook Secret Key
   * @returns {boolean}
   */
  static verifyWebhookSignature(rawBody, signature, secret) {
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    return this.verifyTimingSafe(expected, signature);
  }
}
