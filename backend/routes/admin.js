// routes/admin.js
import express from "express";
import User from "../models/User.js";
import isAdmin from "../middleware/isAdmin.js";
import verifyToken from "../middleware/auth.js"; // ✅ Add this import

const router = express.Router();

// ✅ Apply verifyToken before isAdmin
router.get("/users", verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/user/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/user/:id/role", verifyToken, isAdmin, async (req, res) => {
  const { role } = req.body;
  if (!["guest", "user", "admin"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "User not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
