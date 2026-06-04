// const express = require("express");
// const cors = require("cors");
// const morgan = require("morgan");

// const customerRoutes = require("./routes/customerRoutes");
// const supplierRoutes = require("./routes/supplierRoutes");
// const salesOrderRoutes = require("./routes/salesOrderRoutes");
// const purchaseOrderRoutes = require("./routes/purchaseOrderRoutes");
// const grnRoutes = require("./routes/grnRoutes");
// const invoiceRoutes = require("./routes/invoiceRoutes");

// const authRoutes = require("./routes/authRoutes");
// const productRoutes = require("./routes/productRoutes");

// const errorHandler = require("./middlewares/errorMiddleware");

// const app = express();
// // 
// // ✅ CORS (FIXED FOR VERCEL + LOCAL)
// app.use(
//   cors({
//     origin: [
//       "http://localhost:5173",
//       "https://erp-management-system-zeta.vercel.app"
//     ],
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     credentials: true
//   })
// );

// // ✅ Handle preflight requests
// app.options("*", cors());

// // Middleware
// app.use(express.json());
// app.use(morgan("dev"));

// // Root route
// app.get("/", (req, res) => {
//   res.json({ message: "ERP API is running..." });
// });

// // Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/customers", customerRoutes);
// app.use("/api/suppliers", supplierRoutes);
// app.use("/api/sales-orders", salesOrderRoutes);
// app.use("/api/purchase-orders", purchaseOrderRoutes);
// app.use("/api/grn", grnRoutes);
// app.use("/api/invoices", invoiceRoutes);

// // Error handler (must be last)
// app.use(errorHandler);

// module.exports = app;