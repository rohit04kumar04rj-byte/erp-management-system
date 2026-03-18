const express = require("express");
const {
  createSalesOrder,
  getAllSalesOrders,
  getSingleSalesOrder,
  updateSalesOrderStatus,
  deleteSalesOrder,
} = require("../controllers/salesOrderController");

const protect = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

const router = express.Router();

router
  .route("/")
  .get(protect, authorizeRoles("admin", "sales"), getAllSalesOrders)
  .post(protect, authorizeRoles("admin", "sales"), createSalesOrder);

router
  .route("/:id")
  .get(protect, authorizeRoles("admin", "sales"), getSingleSalesOrder)
  .put(protect, authorizeRoles("admin", "sales"), updateSalesOrderStatus)
  .delete(protect, authorizeRoles("admin"), deleteSalesOrder);

module.exports = router;