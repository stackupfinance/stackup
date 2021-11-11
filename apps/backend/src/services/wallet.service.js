const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const Wallet = require('../models/wallet.model');

/**
 * Create an internal wallet
 * @param {ObjectId} userId
 * @returns {Promise<Wallet>}
 */
const createWallet = async (userId, walletBody) => {
  if (await Wallet.alreadyCreated(userId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User already has a wallet');
  }
  return Wallet.create({
    user: userId,
    ...walletBody,
  });
};

/**
 * Get a users linked wallets
 * @param {ObjectId} userId
 * @returns {Promise<Array<Wallet>>}
 */
const getUserWallet = async (userId) => {
  return Wallet.findOne({ user: userId });
};

/**
 * delete all users linked wallets
 * @param {ObjectId} userId
 * @returns {Promise<Object>}
 */
const deleteUserWallets = async (userId) => {
  return Wallet.deleteMany({ user: userId });
};

module.exports = {
  createWallet,
  getUserWallet,
  deleteUserWallets,
};
