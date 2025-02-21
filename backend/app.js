// app.js
import express from "express";
import dotenv from "dotenv";
import connectDB from "./db.js";
import userRoutes from "./routes/user.js";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

// Mount user routes under /api/user
app.use("/api/user", userRoutes);

// Health check route (optional)
app.get("/", (req, res) => {
  res.send("API is running");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
