const express = require("express");

const {
  registerUser,
  loginUser,
} = require("../controllers/authController");

const { authenticateUser } = require("../middleware/authMiddleware");   

const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Register a new user
router.post("/register", registerUser);

// Login user
router.post("/login", loginUser);

// Protected route - returns logged-in user
router.get("/me", authenticateUser, (req, res) => {
  res.status(200).json({
    success: true,
    message: "You are authenticated.",
    user: req.user,
  });
});

router.get(
  "/admin-test",
  authenticateUser,
  roleMiddleware("admin"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Admin access granted.",
      user: req.user,
    });
  }
);



module.exports = router;