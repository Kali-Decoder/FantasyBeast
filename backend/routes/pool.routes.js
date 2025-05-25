const express = require("express");
const router = express.Router();
const Pool = require("../models/pool.schema");

router.post("/", async (req, res) => {
  try {
    const { creator, marketType, question, url, endTime } = req.body;

    if (!creator || !marketType || !question || !url || !endTime) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const pool = new Pool({
      creator,
      marketType,
      question,
      url,
      endTime,
    });

    await pool.save();
    return res.status(201).json(pool);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to register pool." });
  }
});

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
