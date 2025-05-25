const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    trxHash: {
      type: String,
      required: true,
      unique: true,
    },
    event: {
      type: String,
      required: true,
      enum: ["create", "range-based", "binary-based"],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    pointsEarned: {
      type: Number,
      required: true,
    },
    walletAddress: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", TransactionSchema);
