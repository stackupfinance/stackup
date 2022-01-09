const { ethers } = require('ethers');
const { wallet } = require('@stackupfinance/contracts');
const { web3, featureFlag } = require('../../config/config');
const { signer } = require('../../utils/web3');
const transactionService = require('../../services/transaction.service');

module.exports.airdropUSDC = async (req, res, next) => {
  if (!featureFlag.airdropUSDC) next();

  const { userId } = req.params;
  const { walletAddress } = req.body;
  const userOperations = await Promise.all([
    wallet.userOperations.sign(
      signer,
      wallet.userOperations.get(web3.paymaster, {
        nonce: await wallet.proxy.getNonce(signer.provider, web3.paymaster),
        callData: wallet.encodeFunctionData.ERC20Transfer(web3.usdc, walletAddress, ethers.utils.parseUnits('25', 'mwei')),
      })
    ),
  ]);

  transactionService.monitorGenericRelayTransaction({ userId, userOperations });
  next();
};
