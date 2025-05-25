const express = require("express");
const router = express.Router();

const User = require("../models/user.schema");


// Get leaderboard

router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ xpPoints: -1 });
    return res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch leaderboard." });
  }
});

module.exports = router;