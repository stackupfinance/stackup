const { ethers } = require('ethers');
const { wallet, contracts } = require('@stackupfinance/contracts');
const { web3 } = require('../config/config');
const { status } = require('../config/transaction');

const loginMessage = 'Welcome to Stackup!';

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

module.exports.isWalletDeployed = async (walletAddress) => wallet.proxy.isCodeDeployed(provider, walletAddress);

module.exports.recoverAddressFromLoginSignature = (signature) => ethers.utils.verifyMessage(loginMessage, signature);

module.exports.walletContract = (walletAddress) => contracts.Wallet.getInstance(provider).attach(walletAddress);

module.exports.getWalletGuardians = async (userWallet) => {
  const isDeployed = await wallet.proxy.isCodeDeployed(provider, userWallet.walletAddress);
  const guardians = isDeployed
    ? await wallet.access.getGuardians(this.walletContract(userWallet.walletAddress))
    : userWallet.initGuardians;

  return guardians;
};
