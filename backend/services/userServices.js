const User = require("../models/user.schema");

const createUser = async (address) => {
  const existingUser = await User.findOne({
    walletAddress: address.toLowerCase(),
  });
  if (existingUser) return existingUser;

  const user = new User({ walletAddress: address.toLowerCase(), xpPoints: 0 });
  return await user.save();
};

const getUserByAddress = async (address) => {
  return await User.findOne({ walletAddress: address.toLowerCase() });
};

const getOrCreateUser = async (address) => {
  const user = await getUserByAddress(address);
  if (user) return user;
  return await createUser(address);
};

module.exports = {
  createUser,
  getUserByAddress,
  getOrCreateUser,
};
