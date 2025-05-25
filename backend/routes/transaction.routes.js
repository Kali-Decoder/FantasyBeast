const express = require("express");
const router = express.Router();
const Transaction = require("../models/transactions.schema");

router.post("/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { trxHash, event, pointsEarned } = req.body;

    if (!trxHash || !event || pointsEarned === undefined) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const transaction = new Transaction({
      trxHash,
      event,
      pointsEarned,
      walletAddress: walletAddress.toLowerCase(),
    });

    await transaction.save();
    return res.status(201).json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Transaction creation failed." });
  }
});

router.get("/:walletAddress", async (req, res) => {
  try {
    const walletAddress = req.params.walletAddress.toLowerCase();

    const transactions = await Transaction.find({ walletAddress });

    return res.status(200).json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch transactions." });
  }
});

module.exports = router;
