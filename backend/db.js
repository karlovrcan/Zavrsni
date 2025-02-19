import mongoose from "mongoose";

const MONGO_URI = "mongodb://localhost:27017/mernavth"; // Corrected MongoDB URI

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1); // Exit process on failure
  }
};

export default connectDB;
