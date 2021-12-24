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
 * Get a user's linked wallet
 * @param {ObjectId} userId
 * @returns {Promise<Wallet>}
 */
const getUserWallet = async (userId) => {
  return Wallet.findOne({ user: userId });
};

/**
 * Update user's linked wallet
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<Wallet>}
 */
const updateUserWallet = async (userId, updateBody) => {
  const wallet = await getUserWallet(userId);
  if (!wallet) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Wallet not found');
  }
  Object.assign(wallet, updateBody);

  await wallet.save();
  return wallet;
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
  updateUserWallet,
  deleteUserWallets,
};
