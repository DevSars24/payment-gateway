import dotenv from "dotenv";
import connectDB from "./database.js";
import app from "./app.js";

// Load environment variables
dotenv.config({ path: "./config/config.env" });

// Connect to MongoDB
connectDB();

// Start server
const PORT = process.env.PORT || 4000;

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error("❌ Razorpay credentials are missing in config.env");
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
