const { createTransactionService, getTransactionsByAddress } = require("../services/transactionService");

const createTransactionController = async (req, res) => {
  try {
    const { trxHash, event, userAddress } = req.body;

    if (!trxHash || !event || !userAddress) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const result = await createTransactionService({ trxHash, event, userAddress });
    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || "Transaction creation failed." });
  }
};

const getTransactionsController = async (req, res) => {
  try {
    const { userAddress } = req.body;

    if (!userAddress) {
      return res.status(400).json({ error: "Wallet address is required." });
    }

    const transactions = await getTransactionsByAddress(userAddress);
    return res.status(200).json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch transactions." });
  }
};

module.exports = {
  createTransactionController,
  getTransactionsController,
};
