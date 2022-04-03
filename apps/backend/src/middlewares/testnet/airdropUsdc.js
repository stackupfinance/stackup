const { ethers } = require('ethers');
const { wallet } = require('@stackupfinance/walletjs');
const { web3, featureFlag } = require('../../config/config');
const { type } = require('../../config/transaction');
const { signer } = require('../../utils/web3');
const transactionService = require('../../services/transaction.service');

module.exports.airdropUSDC = async (req, res, next) => {
  const { userId } = req.params;
  const { walletAddress, initOwner } = req.body;
  if (!featureFlag.airdropUSDC || !initOwner) {
    next();
  } else {
    const userOperations = await Promise.all([
      wallet.userOperations.sign(
        signer,
        wallet.userOperations.get(web3.paymaster, {
          nonce: await wallet.proxy.getNonce(signer.provider, web3.paymaster),
          callData: wallet.encodeFunctionData.ERC20Transfer(web3.usdc, walletAddress, ethers.utils.parseUnits('25', 'mwei')),
        })
      ),
    ]);
    const tx = await transactionService.createTransaction({
      ...(await transactionService.parseUserOperations(userOperations)),
      type: type.genericRelay,
    });

    transactionService.relayTransaction({ userId, transactionId: tx._id, userOperations });
    next();
  }
};
