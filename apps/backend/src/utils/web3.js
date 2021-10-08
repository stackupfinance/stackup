const { ethers } = require('ethers');

/**
 * Create a new web3 wallet
 * @returns {Object}
 */
const createWallet = () => {
  const wallet = ethers.Wallet.createRandom();

  return {
    address: wallet.address,
    publicKey: wallet.publicKey,
    mnemonic: wallet.mnemonic.phrase,
  };
};

module.exports = {
  createWallet,
};
