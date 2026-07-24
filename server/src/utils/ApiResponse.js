/**
 * Standardized API Response Wrapper ensuring consistent JSON structure.
 * Response Format:
 * {
 *   success: boolean,
 *   statusCode: number,
 *   message: string,
 *   data: object|array|null,
 *   meta: object|null,
 *   timestamp: string
 * }
 */
export class ApiResponse {
  constructor(statusCode, message, data = null, meta = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    if (meta) this.meta = meta;
    this.timestamp = new Date().toISOString();
  }

  static success(res, statusCode = 200, message = "Success", data = null, meta = null) {
    const response = new ApiResponse(statusCode, message, data, meta);
    return res.status(statusCode).json(response);
  }

  static error(res, statusCode = 500, message = "An error occurred", details = null) {
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      error: details,
      timestamp: new Date().toISOString(),
    });
  }
}
