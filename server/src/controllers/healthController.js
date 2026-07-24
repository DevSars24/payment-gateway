import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";

/**
 * Controller: Health Probe and System Diagnostics.
 */
export const getHealthStatus = (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "UP" : "DOWN";
  const memoryUsage = process.memoryUsage();

  const healthData = {
    status: "UP",
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
    },
    system: {
      uptimeSeconds: Math.floor(process.uptime()),
      memory: {
        rssMB: (memoryUsage.rss / 1024 / 1024).toFixed(2),
        heapTotalMB: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2),
        heapUsedMB: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
      },
      nodeVersion: process.version,
    },
  };

  const statusCode = dbStatus === "UP" ? 200 : 503;
  return ApiResponse.success(res, statusCode, "System health status", healthData);
};
