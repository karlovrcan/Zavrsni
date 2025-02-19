import express from "express";
import connectDB from "./db.js"; // Import fixed MongoDB connection
import userRoutes from "./routes/user.js"; // Correct import for user routes
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000; // Corrected PORT assignment

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json()); // Enable JSON parsing

// Routes
app.use("/api/user", userRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
