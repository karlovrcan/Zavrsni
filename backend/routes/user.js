import express from "express";

const router = express.Router();

router.post("/login", (req, res) => {
  res.json({ message: "🟢 Login Successful" });
});

router.post("/register", (req, res) => {
  res.json({ message: "🟢 Registration Successful" });
});

export default router;
