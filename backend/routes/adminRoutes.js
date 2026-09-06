const express = require("express");

const {
  getDashboardStats,
  getUsers,
    createUser,
    updateUser,
} = require("../controllers/adminController");

const { authenticateUser } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Admin dashboard statistics
router.get(
  "/dashboard",
  authenticateUser,
  roleMiddleware("admin"),
  getDashboardStats
);
router.get(
  "/users",
  authenticateUser,
  roleMiddleware("admin"),
  getUsers
);

router.post(
  "/users",
  authenticateUser,
  roleMiddleware("admin"),
  createUser
);

router.put(
  "/users/:id",
  authenticateUser,
  roleMiddleware("admin"),
  updateUser
);
module.exports = router;