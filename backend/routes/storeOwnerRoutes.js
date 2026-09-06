const express = require("express");

const {
  getStoreOwnerDashboard,
} = require("../controllers/storeOwnerController");

const { authenticateUser } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Store owner can view their own dashboard
router.get(
  "/dashboard",
  authenticateUser,
  roleMiddleware("store_owner"),
  getStoreOwnerDashboard
);

module.exports = router;