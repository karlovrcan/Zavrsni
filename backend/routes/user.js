// user.js
import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../Models/User.js";
import generateToken from "../Helper/generateToken.js";

dotenv.config();

const router = express.Router();

/**
 * @route   POST /api/user/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", async (req, res) => {
  try {
    console.log("Received registration request:", req.body); // ✅ Debugging log

    const { username, password, email, day, month, year } = req.body;

    if (!username || !password || !email || !day || !month || !year) {
      console.error("❌ Missing required fields:", req.body);
      return res.status(400).json({ message: "Please fill in all fields." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.error("❌ Email already exists:", email);
      return res.status(400).json({ message: "Email already in use!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      day,
      month,
      year,
    });

    await newUser.save();
    console.log("✅ User registered successfully:", newUser);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("❌ Registration error:", error); // ✅ Print detailed error
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

/**
 * @route   POST /api/user/login
 * @desc    Authenticate user and return token
 * @access  Public
 */
router.post("/login", async (req, res) => {
  const { login, password } = req.body;
  try {
    // Find a user where either username or email matches the provided login value
    const user = await User.findOne({
      $or: [{ username: login }, { email: login }],
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Login cretentials incorrect." });
    }

    // Sign and return a JWT token
    const token = await generateToken(user._id);
    return res.status(200).json({
      message: "Login successful",
      token,
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/users", async (req, res) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin")
      return res.status(403).json({ message: "Forbidden: Admins only" });

    const users = await User.find().select("-password");
    res.json({ users, success: true, message: "Users retrieved" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", async (req, res) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.json({ success: true, user });
  } catch (error) {
    res
      .status(403)
      .json({ success: false, message: "Invalid or expired token" });
  }
});

export default router;
