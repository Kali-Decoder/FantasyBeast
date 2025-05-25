const express = require("express");
const router = express.Router();
const Transaction = require("../models/transactions.schema");
const User = require("../models/user.schema");
router.post("/", async (req, res) => {
  try {
    const { trxHash, event, userAddress } = req.body;

    if (!trxHash || !event) {
      return res.status(400).json({ error: "All fields are required." });
    }
    let pointsEarned = 0;
    if (event === "range-based") {
      pointsEarned = 10;
    } else if (event === "binary-based") {
      pointsEarned = 20;
    } else if (event === "create") {
      pointsEarned = 30;
    } else {
      return res.status(400).json({ error: "Invalid event type." });
    }
    if (!userAddress) {
      return res.status(400).json({ error: "Wallet address is required." });
    }

    const user = await User.findOne({ walletAddress: userAddress.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    user.xpPoints += Number(pointsEarned);
    await user.save();

    const transaction = new Transaction({
      trxHash,
      event,
      pointsEarned,
      walletAddress: userAddress.toLowerCase(),
    });

    await transaction.save();
    return res.status(201).json({ transaction, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Transaction creation failed." });
  }
});

router.get("/", async (req, res) => {
  try {
    const {userAddress } = req.body;
    if(!userAddress){
      
    }
    const transactions = await Transaction.find({ walletAddress:userAddress.toLowerCase() });
    return res.status(200).json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch transactions." });
  }
});

module.exports = router;
