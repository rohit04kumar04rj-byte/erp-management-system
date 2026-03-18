const express = require("express");
const {
  createCustomer,
  getAllCustomers,
  getSingleCustomer,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");

const protect = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

const router = express.Router();

router
  .route("/")
  .get(protect, getAllCustomers)
  .post(protect, authorizeRoles("admin", "sales"), createCustomer);

router
  .route("/:id")
  .get(protect, getSingleCustomer)
  .put(protect, authorizeRoles("admin", "sales"), updateCustomer)
  .delete(protect, authorizeRoles("admin"), deleteCustomer);

module.exports = router;