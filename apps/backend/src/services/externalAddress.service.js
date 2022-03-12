const { ExternalAddress } = require('../models');

const getUserByExternalAddress = async (username) => {
  return ExternalAddress.findOne({ username });
};

const createUserWithExternalAddress = async (walletAddress) => {
  return ExternalAddress.create({ username: walletAddress, wallet: walletAddress });
};

module.exports = { getUserByExternalAddress, createUserWithExternalAddress };
