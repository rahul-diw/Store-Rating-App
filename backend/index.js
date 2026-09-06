const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./db");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const storeRoutes = require("./routes/storeRoutes");
const storeOwnerRoutes = require("./routes/storeOwnerRoutes");
const ratingRoutes = require("./routes/ratingRoutes");


const app = express();

const port = process.env.PORT || 3000;

// =========================
// CORS
// =========================

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// =========================
// Middleware
// =========================

app.use(express.json());

// =========================
// Routes
// =========================

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/store-owner", storeOwnerRoutes);
app.use("/api/ratings", ratingRoutes);


// =========================
// Test route
// =========================

app.get("/", (req, res) => {
  res.send("Store Rating API is running!");
});

// =========================
// Database connection test
// =========================

app.get("/api/db-test", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 AS result");

    res.status(200).json({
      success: true,
      message: "Database connected successfully!",
      result: rows[0].result,
    });
  } catch (error) {
    console.error("Database connection error:", error.message);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// =========================
// Start server
// =========================

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});