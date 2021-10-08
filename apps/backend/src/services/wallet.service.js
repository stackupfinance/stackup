const Wallet = require('../models/wallet.model');
const web3 = require('../utils/web3');
const { walletTypes } = require('../config/wallets');

/**
 * Create an internal wallet
 * @param {ObjectId} userId
 * @returns {Promise<Wallet>}
 */
const createInternalWallet = async (userId) => {
  const { address, publicKey, mnemonic } = web3.createWallet();
  return Wallet.create({
    user: userId,
    type: walletTypes.internal,
    name: 'Stackup',
    address,
    publicKey,
    mnemonic,
  });
};

/**
 * Get a users linked wallets
 * @param {ObjectId} userId
 * @returns {Promise<Array<Wallet>>}
 */
const getUserWallets = async (userId) => {
  const userWallets = await Wallet.find({ user: userId });
  return userWallets.map((doc) => {
    Object.assign(doc, { mnemonic: undefined });
    return doc;
  });
};

/**
 * Get a users linked wallets with decrypted mnemonic.
 * @param {ObjectId} userId
 * @returns {Promise<Array<Wallet>>}
 */
const getUserWalletsWithMnemonic = async (userId) => {
  const userWallets = await Wallet.find({ user: userId });
  return Promise.all(
    userWallets.map(async (doc) => {
      Object.assign(doc, { mnemonic: await doc.getDecryptedMnemonic() });
      return doc;
    })
  );
};

/**
 * delete all users linked wallets.
 * @param {ObjectId} userId
 * @returns {Promise<Object>}
 */
const deleteUserWallets = async (userId) => {
  return Wallet.deleteMany({ user: userId });
};

module.exports = {
  createInternalWallet,
  getUserWallets,
  getUserWalletsWithMnemonic,
  deleteUserWallets,
};
