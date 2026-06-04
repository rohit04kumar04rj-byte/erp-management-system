const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

// ======================
// ✅ CORS FIX (CRITICAL)
// ======================
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://erp-management-system-r5fqrai79.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
  })
);

// ✅ IMPORTANT for preflight
app.options("*", cors());

// ======================
// Middleware
// ======================
app.use(express.json());
app.use(morgan("dev"));

// ======================
// IMPORT APP ROUTES (if using app.js)
// ======================
const serverApp = require("./app"); // if you already split logic

// OR if routes are inside this file, keep them here instead

// ======================
// START SERVER
// ======================
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});