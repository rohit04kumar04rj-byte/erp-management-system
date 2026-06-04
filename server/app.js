const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const customerRoutes = require("./routes/customerRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const salesOrderRoutes = require("./routes/salesOrderRoutes");
const purchaseOrderRoutes = require("./routes/purchaseOrderRoutes");
const grnRoutes = require("./routes/grnRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const errorHandler = require("./middlewares/errorMiddleware");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://erp-management-system-mtw3yss90.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ message: "ERP API is running..." });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/sales-orders", salesOrderRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/grn", grnRoutes);
app.use("/api/invoices", invoiceRoutes);

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;

// Server start
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});