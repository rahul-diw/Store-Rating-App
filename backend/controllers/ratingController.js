const db = require("../db");


// =====================================================
// CREATE OR UPDATE RATING
// =====================================================

const createOrUpdateRating = async (req, res) => {
  try {
    // Logged-in user ID from JWT
    const userId = req.user.id;

    const { store_id, rating } = req.body;

    // Check required fields
    if (!store_id || rating === undefined) {
      return res.status(400).json({
        success: false,
        message: "Store ID and rating are required.",
      });
    }

    // Convert values to numbers
    const storeId = Number(store_id);
    const ratingValue = Number(rating);

    // Validate store ID
    if (!Number.isInteger(storeId) || storeId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid store ID.",
      });
    }

    // Rating must be integer between 1 and 5
    if (
      !Number.isInteger(ratingValue) ||
      ratingValue < 1 ||
      ratingValue > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5.",
      });
    }

    // Check whether store exists
    const [stores] = await db.query(
      "SELECT id, name FROM stores WHERE id = ?",
      [storeId]
    );

    if (stores.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Store not found.",
      });
    }

    // Check whether user already rated this store
    const [existingRatings] = await db.query(
      `SELECT id, rating
       FROM ratings
       WHERE user_id = ? AND store_id = ?`,
      [userId, storeId]
    );

    // If rating already exists → UPDATE
    if (existingRatings.length > 0) {
      await db.query(
        `UPDATE ratings
         SET rating = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [ratingValue, existingRatings[0].id]
      );

      return res.status(200).json({
        success: true,
        message: "Rating updated successfully.",
        rating: {
          id: existingRatings[0].id,
          user_id: userId,
          store_id: storeId,
          rating: ratingValue,
        },
      });
    }

    // Otherwise → CREATE new rating
    const [result] = await db.query(
      `INSERT INTO ratings (user_id, store_id, rating)
       VALUES (?, ?, ?)`,
      [userId, storeId, ratingValue]
    );

    return res.status(201).json({
      success: true,
      message: "Rating submitted successfully.",
      rating: {
        id: result.insertId,
        user_id: userId,
        store_id: storeId,
        rating: ratingValue,
      },
    });
  } catch (error) {
    console.error("Create/update rating error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while submitting the rating.",
    });
  }
};


// =====================================================
// UPDATE RATING BY RATING ID
// =====================================================

const updateRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    const userId = req.user.id;

    // Convert values
    const ratingId = Number(id);
    const ratingValue = Number(rating);

    // Validate rating ID
    if (!Number.isInteger(ratingId) || ratingId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid rating ID.",
      });
    }

    // Validate rating
    if (
      !Number.isInteger(ratingValue) ||
      ratingValue < 1 ||
      ratingValue > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5.",
      });
    }

    // Check whether rating exists
    // and belongs to logged-in user
    const [ratings] = await db.query(
      `SELECT id, user_id, store_id
       FROM ratings
       WHERE id = ? AND user_id = ?`,
      [ratingId, userId]
    );

    if (ratings.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Rating not found or you do not have permission to update it.",
      });
    }

    // Update rating
    await db.query(
      `UPDATE ratings
       SET rating = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [ratingValue, ratingId, userId]
    );

    return res.status(200).json({
      success: true,
      message: "Rating updated successfully.",
      rating: {
        id: ratingId,
        user_id: userId,
        store_id: ratings[0].store_id,
        rating: ratingValue,
      },
    });
  } catch (error) {
    console.error("Update rating error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating the rating.",
    });
  }
};


// =====================================================
// GET ALL RATINGS
// =====================================================

const getRatings = async (req, res) => {
  try {
    const [ratings] = await db.query(`
      SELECT
        r.id,
        r.user_id,
        u.name AS user_name,
        r.store_id,
        s.name AS store_name,
        r.rating,
        r.created_at,
        r.updated_at
      FROM ratings r
      INNER JOIN users u
        ON r.user_id = u.id
      INNER JOIN stores s
        ON r.store_id = s.id
      ORDER BY r.id DESC
    `);

    return res.status(200).json({
      success: true,
      count: ratings.length,
      ratings,
    });
  } catch (error) {
    console.error("Get ratings error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching ratings.",
    });
  }
};


module.exports = {
  createOrUpdateRating,
  updateRating,
  getRatings,
};