const express = require("express");

const {
  createOrUpdateRating,
  updateRating,
  getRatings,
} = require("../controllers/ratingController");

const { authenticateUser } = require("../middleware/authMiddleware");

const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Normal users can submit or update ratings
router.post(
  "/",
  authenticateUser,
  roleMiddleware("user"),
  createOrUpdateRating
);

// Normal users can update their own rating
router.put(
  "/:id",
  authenticateUser,
  roleMiddleware("user"),
  updateRating
);
// Get all ratings
router.get(
  "/",
  authenticateUser,
  getRatings
);

module.exports = router;