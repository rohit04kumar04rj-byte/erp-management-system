const express = require("express");
const {
  createPurchaseOrder,
  getAllPurchaseOrders,
  getSinglePurchaseOrder,
  updatePurchaseOrderStatus,
  deletePurchaseOrder,
} = require("../controllers/purchaseOrderController");

const protect = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

const router = express.Router();

router
  .route("/")
  .get(protect, authorizeRoles("admin", "purchase"), getAllPurchaseOrders)
  .post(protect, authorizeRoles("admin", "purchase"), createPurchaseOrder);

router
  .route("/:id")
  .get(protect, authorizeRoles("admin", "purchase"), getSinglePurchaseOrder)
  .put(protect, authorizeRoles("admin", "purchase"), updatePurchaseOrderStatus)
  .delete(protect, authorizeRoles("admin"), deletePurchaseOrder);

module.exports = router;