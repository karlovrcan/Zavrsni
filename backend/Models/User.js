// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  DOB: { type: Date, required: true },
  gender: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// Use ESM export instead of CommonJS
export default User;
