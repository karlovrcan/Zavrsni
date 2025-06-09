import express from "express";
import Category from "../Models/Category.js";
import isAdmin from "../middleware/isAdmin.js";
import connectDB from "../db.js";
import verifyToken from "../middleware/auth.js";

const router = express.Router();

router.use(async (req, res, next) => {
  await connectDB();
  next();
});

router.get("/", async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
});

router.post("/", verifyToken, isAdmin, async (req, res) => {
  const { label, tags, color } = req.body;
  if (!label || !tags || !Array.isArray(tags) || !color)
    return res.status(400).json({ error: "Missing or invalid fields" });

  const newCategory = await Category.create({ label, tags, color });
  res.status(201).json(newCategory);
});

router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;
