const { ExternalAddress } = require('../models');

const getUserByExternalAddress = async (username) => {
  return ExternalAddress.findOne({ username });
};

const createUserWithExternalAddress = async (walletAddress) => {
  function changeUsername(username) {
    return `${username.slice(0, 5)}....${username.slice(-5)}`;
  }
  return ExternalAddress.create({ username: changeUsername(walletAddress), wallet: walletAddress });
};

module.exports = { getUserByExternalAddress, createUserWithExternalAddress };
