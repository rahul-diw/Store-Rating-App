const express = require("express");

const {
  createStore,
  getStores,
  getStoreRatings,
} = require("../controllers/storeController");

const {
  authenticateUser,
} = require("../middleware/authMiddleware");

const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", authenticateUser, getStores);

router.get(
  "/:store_id/ratings",
  authenticateUser,
  getStoreRatings
);

router.post(
  "/",
  authenticateUser,
  roleMiddleware("admin"),
  createStore
);

module.exports = router;