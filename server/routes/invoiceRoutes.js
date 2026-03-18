const express = require("express");
const {
  createInvoice,
  getAllInvoices,
  getSingleInvoice,
  updateInvoiceStatus,
} = require("../controllers/invoiceController");

const { generateInvoicePDF } = require("../controllers/invoicePdfController");

const protect = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

const router = express.Router();

// MAIN ROUTES
router
  .route("/")
  .get(protect, authorizeRoles("admin", "sales"), getAllInvoices)
  .post(protect, authorizeRoles("admin", "sales"), createInvoice);

router
  .route("/:id")
  .get(protect, authorizeRoles("admin", "sales"), getSingleInvoice)
  .put(protect, authorizeRoles("admin", "sales"), updateInvoiceStatus);

// ✅ ADD PDF ROUTE HERE (IMPORTANT)
router.get(
  "/:id/pdf",
  protect,
  authorizeRoles("admin", "sales"),
  generateInvoicePDF
);

module.exports = router;