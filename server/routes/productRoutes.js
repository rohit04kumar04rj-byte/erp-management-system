const express = require("express");
const {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const protect = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

const router = express.Router();

router
  .route("/")
  .get(protect, getAllProducts)
  .post(protect, authorizeRoles("admin", "inventory"), createProduct);

router
  .route("/:id")
  .get(protect, getSingleProduct)
  .put(protect, authorizeRoles("admin", "inventory"), updateProduct)
  .delete(protect, authorizeRoles("admin"), deleteProduct);

module.exports = router;