const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../db");

const registerUser = async (req, res) => {
  try {

const { name, email, address, password } = req.body;

// Basic input validation
if (!name || !email || !address || !password) {
  return res.status(400).json({
    success: false,
    message: "Name, email, address and password are required.",
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

    // Basic input validation
    if (!name || !email || !address || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, address and password are required.",
      });
    }

    // Check if email is already registered
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

    // Hash password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Public registration always creates a normal user
    const [result] = await db.query(
      `INSERT INTO users (name, email, password, address, role)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, address, "user"]
    );

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: {
        id: result.insertId,
        name,
        email,
        address,
        role: "user",
      },
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating the account.",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Find user by email
    const [users] = await db.query(
      "SELECT id, name, email, password, address, role FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const user = users[0];

    // Compare entered password with hashed password
    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while logging in.",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
};