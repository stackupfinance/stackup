const { wallet, contracts } = require('@stackupfinance/contracts');
const { web3 } = require('../config/config');
const { signer, defaultPaymasterFee } = require('../utils/web3');

const signGuardianRecovery = async (walletAddress, newOwner) => {
  return wallet.access.signGuardianRecovery(signer, { guardian: web3.paymaster, wallet: walletAddress, newOwner });
};

const signUserOpWithPaymaster = async (userOperation, index) => {
  return wallet.userOperations.signPaymasterData(
    signer,
    web3.paymaster,
    index > 0 ? 0 : defaultPaymasterFee,
    web3.usdc,
    web3.usdcPriceFeed,
    userOperation
  );
};

const relayUserOpsToEntryPoint = async (userOperations) => {
  return contracts.EntryPoint.getInstance(signer).handleOps(userOperations, signer.address, {
    gasLimit: 5000000,
  });
};

module.exports = {
  signGuardianRecovery,
  signUserOpWithPaymaster,
  relayUserOpsToEntryPoint,
};
