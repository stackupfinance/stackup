const { ethers } = require('ethers');
const { wallet, contracts, constants } = require('@stackupfinance/contracts');
const { web3 } = require('../config/config');
const { signer, defaultPaymasterFee } = require('../utils/web3');

const signUserOpAsGuardian = async (userOperations) => {
  return Promise.all(userOperations.map((op) => wallet.userOperations.signAsGuardian(signer, web3.paymaster, op)));
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
    gasLimit: userOperations.reduce((prev, op) => {
      return prev.add(ethers.BigNumber.from(op.callGas + op.verificationGas + op.preVerificationGas));
    }, ethers.constants.Zero),
    maxFeePerGas: constants.userOperations.defaultMaxFee,
    maxPriorityFeePerGas: constants.userOperations.defaultMaxPriorityFee,
  });
};

module.exports = {
  signUserOpAsGuardian,
  signUserOpWithPaymaster,
  relayUserOpsToEntryPoint,
};
