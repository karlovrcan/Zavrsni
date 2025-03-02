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
  const { username, password, password1, gender, day, month, year, email } =
    req.body;
  try {
    if (!username) {
      return res
        .status(400)
        .json({ message: "You haven't filled all the required fields!" });
    }
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already in use!" });
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (password !== password1) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      password: hashedPassword,
      gender,
      day,
      month,
      year,
      email,
    });

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
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
  const users = await User.find();
  res.json({ users, success: true, message: "user found" });
});

router.get("/me", async (req, res) => {
  try {
    const { token } = req.headers;
    if (!token) {
      return res
        .status(401)
        .json({ success: true, message: "User unauthorised." });
    }
    const data = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(data.id);
    if (user) {
      return res.json({ success: true, message: "User found." });
    }
  } catch (error) {
    res.json({ success: false, message: "Session expired." });
  }
});

export default router;
