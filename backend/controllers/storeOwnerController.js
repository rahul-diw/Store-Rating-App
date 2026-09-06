const db = require("../db");

const getStoreOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Find stores owned by the logged-in store owner
    const [stores] = await db.query(
      `
      SELECT
        s.id,
        s.name,
        s.email,
        s.address,
        COALESCE(ROUND(AVG(r.rating), 1), 0) AS average_rating,
        COUNT(r.id) AS total_ratings
      FROM stores s
      LEFT JOIN ratings r
        ON s.id = r.store_id
      WHERE s.owner_id = ?
      GROUP BY
        s.id,
        s.name,
        s.email,
        s.address
      ORDER BY s.id DESC
      `,
      [ownerId]
    );

    if (stores.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No store is assigned to your account.",
      });
    }

    return res.status(200).json({
      success: true,
      stores,
    });
  } catch (error) {
    console.error("Store owner dashboard error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while loading the dashboard.",
    });
  }
};

module.exports = {
  getStoreOwnerDashboard,
};