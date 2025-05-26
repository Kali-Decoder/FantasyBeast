const Transaction = require("../models/transactions.schema");
const User = require("../models/user.schema");

const getPointsForEvent = (event) => {
  const pointsMap = {
    "range-based": 10,
    "binary-based": 20,
    "create": 30,
  };
  return pointsMap[event] || null;
};

const createTransactionService = async ({ trxHash, event, userAddress }) => {
  const pointsEarned = getPointsForEvent(event);
  if (pointsEarned === null) {
    throw new Error("Invalid event type.");
  }

  const user = await User.findOne({ walletAddress: userAddress.toLowerCase() });
  if (!user) {
    throw new Error("User not found.");
  }

  user.xpPoints += pointsEarned;
  await user.save();

  const transaction = new Transaction({
    trxHash,
    event,
    pointsEarned,
    walletAddress: userAddress.toLowerCase(),
  });

  await transaction.save();
  return { transaction, user };
};

const getTransactionsByAddress = async (walletAddress) => {
  return await Transaction.find({ walletAddress: walletAddress.toLowerCase() });
};

module.exports = {
  createTransactionService,
  getTransactionsByAddress,
};
