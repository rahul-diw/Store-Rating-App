const db = require("../db");
const bcrypt = require("bcrypt");

const getDashboardStats = async (req, res) => {
  try {
    // Get total number of users
    const [userResult] = await db.query(
      "SELECT COUNT(*) AS totalUsers FROM users"
    );

    // Get total number of stores
    const [storeResult] = await db.query(
      "SELECT COUNT(*) AS totalStores FROM stores"
    );

    // Get total number of ratings
    const [ratingResult] = await db.query(
      "SELECT COUNT(*) AS totalRatings FROM ratings"
    );

    return res.status(200).json({
      success: true,
      data: {
        totalUsers: userResult[0].totalUsers,
        totalStores: storeResult[0].totalStores,
        totalRatings: ratingResult[0].totalRatings,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while loading dashboard statistics.",
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const { search, role, sortBy, order } = req.query;

    let query = `
      SELECT id, name, email, address, role, created_at
      FROM users
      WHERE 1 = 1
    `;

    const queryParams = [];

    // Search by name or email
    if (search) {
      query += " AND (name LIKE ? OR email LIKE ?)";
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    // Filter by role
    if (role) {
      const allowedRoles = ["admin", "user", "store_owner"];

      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role filter.",
        });
      }

      query += " AND role = ?";
      queryParams.push(role);
    }

    // Allow only safe database columns for sorting
    const allowedSortFields = {
      name: "name",
      email: "email",
      role: "role",
      created_at: "created_at",
    };

    const selectedSortField =
      allowedSortFields[sortBy] || "created_at";

    const selectedOrder =
      order && order.toLowerCase() === "asc" ? "ASC" : "DESC";

    query += ` ORDER BY ${selectedSortField} ${selectedOrder}`;

    const [users] = await db.query(query, queryParams);

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while loading users.",
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, address, password, role } = req.body;

    // Check required fields
    if (!name || !email || !address || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, address, password and role are required.",
      });
    }

    // Validate name length
    if (name.length < 20 || name.length > 60) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 20 and 60 characters.",
      });
    }

    // Validate address length
    if (address.length > 400) {
      return res.status(400).json({
        success: false,
        message: "Address must not exceed 400 characters.",
      });
    }

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    // Validate password
    const passwordPattern =
      /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

    if (!passwordPattern.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be 8-16 characters and include at least one uppercase letter and one special character.",
      });
    }

    // Only valid application roles are allowed
    const allowedRoles = ["admin", "user", "store_owner"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role.",
      });
    }

    // Check duplicate email
    const [existingUsers] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await db.query(
      `INSERT INTO users (name, email, password, address, role)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, address, role]
    );

    return res.status(201).json({
      success: true,
      message: "User created successfully.",
      user: {
        id: result.insertId,
        name,
        email,
        address,
        role,
      },
    });
  } catch (error) {
    console.error("Create user error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating the user.",
    });
  }
};  

const updateUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid user ID.",
      });
    }

    const { name, email, address, password, role } = req.body;

    // Check whether the user exists
    const [existingUser] = await db.query(
      "SELECT id, name, email, address, role FROM users WHERE id = ?",
      [userId]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const currentUser = existingUser[0];

    // Keep old values when a field is not provided
    const updatedName = name ?? currentUser.name;
    const updatedEmail = email ?? currentUser.email;
    const updatedAddress = address ?? currentUser.address;
    const updatedRole = role ?? currentUser.role;

    // Validate name
    if (updatedName.length < 20 || updatedName.length > 60) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 20 and 60 characters.",
      });
    }

    // Validate address
    if (updatedAddress.length > 400) {
      return res.status(400).json({
        success: false,
        message: "Address must not exceed 400 characters.",
      });
    }

    // Validate email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(updatedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    // Validate role
    const allowedRoles = ["admin", "user", "store_owner"];

    if (!allowedRoles.includes(updatedRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role.",
      });
    }

    // Check whether another user already uses this email
    const [duplicateEmail] = await db.query(
      "SELECT id FROM users WHERE email = ? AND id != ?",
      [updatedEmail, userId]
    );

    if (duplicateEmail.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Another account already uses this email.",
      });
    }

    // Update password only when a new password is provided
    let updateQuery;
    let updateParams;

    if (password) {
      const passwordPattern =
        /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

      if (!passwordPattern.test(password)) {
        return res.status(400).json({
          success: false,
          message:
            "Password must be 8-16 characters and include at least one uppercase letter and one special character.",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      updateQuery = `
        UPDATE users
        SET name = ?, email = ?, address = ?, role = ?, password = ?
        WHERE id = ?
      `;

      updateParams = [
        updatedName,
        updatedEmail,
        updatedAddress,
        updatedRole,
        hashedPassword,
        userId,
      ];
    } else {
      updateQuery = `
        UPDATE users
        SET name = ?, email = ?, address = ?, role = ?
        WHERE id = ?
      `;

      updateParams = [
        updatedName,
        updatedEmail,
        updatedAddress,
        updatedRole,
        userId,
      ];
    }

    await db.query(updateQuery, updateParams);

    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
      user: {
        id: userId,
        name: updatedName,
        email: updatedEmail,
        address: updatedAddress,
        role: updatedRole,
      },
    });
  } catch (error) {
    console.error("Update user error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating the user.",
    });
  }
};

module.exports = {
  getDashboardStats,
    getUsers,
    createUser,
    updateUser,
};