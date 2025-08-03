# 💸 Razorpay Payment Gateway Backend

This is a secure and production-ready backend for handling online payments using **Razorpay**, built with **Node.js**, **Express**, and **MongoDB**. It provides a seamless interface to initiate and verify payments while securely storing all transaction details in a NoSQL database.

---

## 📦 Tech Stack

- **Backend Framework:** Node.js + Express
- **Database:** MongoDB (via Mongoose)
- **Payment Integration:** Razorpay
- **Environment Management:** dotenv
- **HTTP Tool:** Postman / Axios (for testing)

---

## 📁 Project Structure


/server
│
├── controllers/ # Handles business logic
│ └── paymentController.js
│
├── models/ # MongoDB models
│ └── paymentModel.js
│
├── routes/ # Express route definitions
│ └── paymentRoutes.js
│
├── config/ # Environment config
│ └── config.env
│
├── database.js # MongoDB connection logic
├── app.js # Express app setup
├── server.js # Entry point
└── README.md # This file



---

## 🔐 Environment Variables

Create a file named `.env` or `config.env` inside the `/config` directory:

```env
PORT=4000
MONGO_URI=your_mongodb_uri
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
🚀 Features
✅ Create Razorpay orders
✅ Verify payments with cryptographic signatures
✅ Store all payment details securely in MongoDB
✅ Clean, modular code with ES Modules
✅ Logs errors and validation messages clearly
✅ Ready for integration with React or any frontend


🔧 API Endpoints
1. GET /api/payment/getkey
Returns your Razorpay key_id to the frontend.

2. POST /api/payment/checkout
Creates a new Razorpay order.
Body:
{
  "amount": 500
}
3. POST /api/payment/paymentverification
Verifies the payment signature and updates the transaction status.


{
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  amount: Number,
  currency: { type: String, default: "INR" },
  status: { type: String, default: "pending" }
}


# Clone the repository
git clone https://github.com/DevSars24/payment-gateway.git

# Move into the project directory
cd payment-gateway/server

# Install dependencies
npm install

# Start development server
npm run dev

🔐 Security & Notes
Use HTTPS in production

Store sensitive keys in environment variables

Never expose your Razorpay secret key on the frontend





📸 Frontend Integration
Easily integrate with any frontend using Razorpay Checkout:



const options = {
  key: "YOUR_KEY_ID", // From /getkey route
  amount: order.amount,
  currency: "INR",
  name: "Your App Name",
  order_id: order.id,
  handler: function (response) {
    // Send response.razorpay_order_id, payment_id, signature to /paymentverification
  }
};

const rzp = new Razorpay(options);
rzp.open();


👨‍💻 Author
Saurabh Singh Rajput
IIIT Bhagalpur | MERN Stack Developer
GitHub: DevSars24





























