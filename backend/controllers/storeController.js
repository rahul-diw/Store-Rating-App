const db = require("../db");

const createStore = async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;

    // Check required fields
    if (!name || !email || !address || !owner_id) {
      return res.status(400).json({
        success: false,
        message: "Store name, email, address and owner ID are required.",
      });
    }

    // Validate store name
    if (name.length < 20 || name.length > 60) {
      return res.status(400).json({
        success: false,
        message: "Store name must be between 20 and 60 characters.",
      });
    }

    // Validate address
    if (address.length > 400) {
      return res.status(400).json({
        success: false,
        message: "Address must not exceed 400 characters.",
      });
    }

    // Validate email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid store email address.",
      });
    }

    // Validate owner ID
    const parsedOwnerId = Number(owner_id);

    if (!Number.isInteger(parsedOwnerId) || parsedOwnerId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid owner ID.",
      });
    }

    // Check whether the owner exists and has store_owner role
    const [owners] = await db.query(
      "SELECT id, name, email, role FROM users WHERE id = ?",
      [parsedOwnerId]
    );

    if (owners.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Store owner not found.",
      });
    }

    if (owners[0].role !== "store_owner") {
      return res.status(400).json({
        success: false,
        message: "Selected user is not a store owner.",
      });
    }

    // Check duplicate store email
    const [existingStores] = await db.query(
      "SELECT id FROM stores WHERE email = ?",
      [email]
    );

    if (existingStores.length > 0) {
      return res.status(409).json({
        success: false,
        message: "A store with this email already exists.",
      });
    }

    // Create store
    const [result] = await db.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES (?, ?, ?, ?)`,
      [name, email, address, parsedOwnerId]
    );

    return res.status(201).json({
      success: true,
      message: "Store created successfully.",
      store: {
        id: result.insertId,
        name,
        email,
        address,
        owner_id: parsedOwnerId,
      },
    });
  } catch (error) {
    console.error("Create store error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating the store.",
    });
  }
};

const getStores = async (req, res) => {
  try {
    const { search, sortBy, order } = req.query;

    let query = `
      SELECT
        stores.id,
        stores.name,
        stores.email,
        stores.address,
        stores.owner_id,
        users.name AS owner_name,
        users.email AS owner_email,

        COALESCE(AVG(ratings.rating), 0) AS average_rating,
        COUNT(ratings.id) AS review_count

      FROM stores

      INNER JOIN users
        ON stores.owner_id = users.id

      LEFT JOIN ratings
        ON stores.id = ratings.store_id

      WHERE 1 = 1
    `;

    const queryParams = [];

    // Search store name, email or address
    if (search) {
      query += `
        AND (
          stores.name LIKE ?
          OR stores.email LIKE ?
          OR stores.address LIKE ?
        )
      `;

      const searchValue = `%${search}%`;

      queryParams.push(
        searchValue,
        searchValue,
        searchValue
      );
    }

    // Safe sorting fields
    const allowedSortFields = {
      name: "stores.name",
      email: "stores.email",
      address: "stores.address",
      id: "stores.id",
      rating: "average_rating",
      reviews: "review_count",
    };

    const selectedSortField =
      allowedSortFields[sortBy] || "stores.id";

    const selectedOrder =
      order && order.toLowerCase() === "asc"
        ? "ASC"
        : "DESC";

    query += `
      GROUP BY
        stores.id,
        stores.name,
        stores.email,
        stores.address,
        stores.owner_id,
        users.name,
        users.email

      ORDER BY ${selectedSortField} ${selectedOrder}
    `;

    const [stores] = await db.query(
      query,
      queryParams
    );

    return res.status(200).json({
      success: true,
      count: stores.length,
      stores,
    });

  } catch (error) {
    console.error(
      "Get stores error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while loading stores.",
    });
  }
};

const getStoreRatings = async (req, res) => {
  try {
    const { store_id } = req.params;

    const storeId = Number(store_id);

    // Validate store ID
    if (!Number.isInteger(storeId) || storeId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid store ID.",
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

    // Get ratings for this store
    const [ratings] = await db.query(
      `
      SELECT
        r.id,
        r.user_id,
        u.name AS user_name,
        r.store_id,
        r.rating,
        r.created_at,
        r.updated_at
      FROM ratings r
      INNER JOIN users u
        ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.id DESC
      `,
      [storeId]
    );

    return res.status(200).json({
      success: true,
      store: {
        id: stores[0].id,
        name: stores[0].name,
      },
      count: ratings.length,
      ratings,
    });
  } catch (error) {
    console.error("Get store ratings error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching store ratings.",
    });
  }
};

module.exports = {
  createStore,
    getStores,
    getStoreRatings,
};