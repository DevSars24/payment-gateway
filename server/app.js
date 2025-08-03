import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import paymentRoutes from "./routes/paymentRoute.js";

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(helmet());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(limiter);

app.use("/api", paymentRoutes);

app.use((err, req, res, next) => {
  console.error("Express error:", err.message);
  res.status(500).json({ error: "Internal server error", details: err.message });
});

export default app;