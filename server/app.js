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

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ message: "ERP API is running..." });
});

app.use("/api", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/sales-orders", salesOrderRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/grn", grnRoutes);
app.use("/api/invoices", invoiceRoutes);

app.use(cors());
app.use(errorHandler);

module.exports = app;