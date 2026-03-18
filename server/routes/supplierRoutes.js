const express = require("express");
const {
  createSupplier,
  getAllSuppliers,
  getSingleSupplier,
  updateSupplier,
  deleteSupplier,
} = require("../controllers/supplierController");

const protect = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

const router = express.Router();

router
  .route("/")
  .get(protect, getAllSuppliers)
  .post(protect, authorizeRoles("admin", "purchase"), createSupplier);

router
  .route("/:id")
  .get(protect, getSingleSupplier)
  .put(protect, authorizeRoles("admin", "purchase"), updateSupplier)
  .delete(protect, authorizeRoles("admin"), deleteSupplier);

module.exports = router;