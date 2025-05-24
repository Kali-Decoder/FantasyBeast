const mongoose = require("mongoose");
const PoolSchema = new mongoose.Schema(
  {
    creator: {
      type: String,
      required: true,
    },
    marketType: {
      type: String,
      enum: ["binary", "range"],
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
    endTime: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pool", PoolSchema);
