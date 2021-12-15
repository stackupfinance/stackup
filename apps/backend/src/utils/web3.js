const { ethers } = require('ethers');
const { web3 } = require('../config/config');
const { status } = require('../config/payments');

const provider = new ethers.providers.JsonRpcProvider(web3.rpc);

module.exports.defaultPaymasterFee = ethers.BigNumber.from(100000);

module.exports.signer = ethers.Wallet.fromMnemonic(web3.mnemonic).connect(provider);

module.exports.getTransactionStatus = async (transactionHash) => {
  const txReceipt = await provider.getTransactionReceipt(transactionHash);
  if (!txReceipt) {
    return status.pending;
  }
  if (txReceipt.status === 1) {
    return status.success;
  }
  return status.failed;
};
