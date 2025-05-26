const express = require("express");
const router = express.Router();
const Pool = require("../models/pool.schema");
const { createTransactionService } = require("../services/transactionService");

//create market
router.post("/", async (req, res) => {
  try {
    const { creator, marketType, question, url, endTime, trxHash, poolId } =
      req.body;

    if (!creator || !marketType || !question || !url || !endTime) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const pool = new Pool({
      poolId:poolId.toString(),
      creator,
      marketType,
      question,
      url,
      endTime,
    });

    await pool.save();
    await createTransactionService({
      trxHash,
      event: "create",
      userAddress: creator,
    });
    return res.status(201).json(pool);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to register pool." });
  }
});

// Get all pools
router.get("/", async (req, res) => {
  try {
    const pools = await Pool.find().sort({ createdAt: -1 });
    return res.status(200).json(pools);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch pools." });
  }
});

module.exports = router;
