const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
    },
    profilePhoto: {
      type: String,
      default: "", // Default empty string for profile photo
    },
    sessionId: { type: String, default: "" }, // Store session ID from Veriff
  },

  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
