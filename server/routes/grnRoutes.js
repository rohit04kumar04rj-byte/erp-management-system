const express = require("express");
const {
  createGRN,
  getAllGRNs,
  getSingleGRN,
} = require("../controllers/grnController");

const protect = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

const router = express.Router();

router
  .route("/")
  .get(protect, authorizeRoles("admin", "inventory", "purchase"), getAllGRNs)
  .post(protect, authorizeRoles("admin", "inventory"), createGRN);

router
  .route("/:id")
  .get(protect, authorizeRoles("admin", "inventory", "purchase"), getSingleGRN);

module.exports = router;