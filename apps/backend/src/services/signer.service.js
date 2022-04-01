const { ethers } = require('ethers');
const { wallet, contracts, constants } = require('@stackupfinance/contracts');
const { web3 } = require('../config/config');
const { signer, defaultPaymasterFee, getChainId, getBalance } = require('../utils/web3');
const { functionSignatures } = require('../config/transaction');

const signUserOpAsGuardian = async (userOperations) => {
  return Promise.all(userOperations.map((op) => wallet.userOperations.signAsGuardian(signer, web3.paymaster, op)));
};

const signUserOpWithPaymaster = async (userOperation, index) => {
  // TODO: Fix this in the wallet smart contract. This is a bypass for alpha release.
  const isApprovingFeeTokenOnNonPaymaster = (userOp) => {
    const opcd = wallet.decodeCallData.fromUserOperation(userOp);
    const wcd = wallet.decodeCallData.Erc20FromExecuteUserOp(opcd);
    if (!wcd) return false;

    const isApprove = wcd.signature === functionSignatures.erc20Approve;
    const isFeeToken = opcd.args[0] === web3.usdc;
    const isNotPaymaster = wcd.args[0] !== web3.paymaster;
    if (isApprove && isFeeToken && isNotPaymaster) {
      return true;
    }
    return false;
  };

  return wallet.userOperations.signPaymasterData(
    signer,
    web3.paymaster,
    index > 0 || isApprovingFeeTokenOnNonPaymaster(userOperation) ? 0 : defaultPaymasterFee,
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

const getPublicStats = async () => {
  const [chainId, relayerBalance, paymasterBalance, paymasterStake] = await Promise.all([
    getChainId(),
    getBalance(signer.address),
    getBalance(web3.paymaster),
    contracts.EntryPoint.getInstance(signer.provider).getStake(web3.paymaster),
  ]);

  return {
    relayer: {
      balance: {
        [chainId]: Number.parseFloat(ethers.utils.formatEther(relayerBalance)),
      },
    },
    paymaster: {
      balance: {
        [chainId]: Number.parseFloat(ethers.utils.formatEther(paymasterBalance)),
      },
      stake: {
        [chainId]: Number.parseFloat(ethers.utils.formatEther(paymasterStake[0])),
      },
    },
  };
};

module.exports = {
  signUserOpAsGuardian,
  signUserOpWithPaymaster,
  relayUserOpsToEntryPoint,
  getPublicStats,
};
