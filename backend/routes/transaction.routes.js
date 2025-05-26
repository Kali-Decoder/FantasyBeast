const express = require("express");
const router = express.Router();

const {
  createTransactionController,
  getTransactionsController,
} = require("../controllers/transaction.controller");

router.post("/", createTransactionController);
router.get("/", getTransactionsController);

module.exports = router;
