const express = require("express");
const router = express.Router();

const User = require("../models/user.schema");


router.post("/register", async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: "Wallet address is required." });
    }

    let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

    if (!user) {
      user = new User({ walletAddress: walletAddress.toLowerCase(), xpPoints: 0 });
      await user.save();
    }

    return res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

// Get user data
router.get("/:walletAddress", async (req, res) => {
  try {
    const walletAddress = req.params.walletAddress.toLowerCase();

    const user = await User.findOne({ walletAddress });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;
