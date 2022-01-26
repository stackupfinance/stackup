const { ethers } = require('ethers');
const { wallet, contracts, constants } = require('@stackupfinance/contracts');
const { web3 } = require('../config/config');
const { eventSignatures, status } = require('../config/transaction');

const loginMessage = 'Welcome to Stackup!';

const provider = new ethers.providers.JsonRpcProvider(web3.rpc);

module.exports.defaultPaymasterFee = ethers.BigNumber.from(100000);

module.exports.signer = ethers.Wallet.fromMnemonic(web3.mnemonic).connect(provider);

module.exports.getChainId = async () => {
  return provider.getNetwork().then((n) => n.chainId);
};

module.exports.getTransactionReceipt = async (hash) => {
  return provider.getTransactionReceipt(hash);
};

module.exports.getTransactionStatus = (txReceipt) => {
  if (!txReceipt) {
    return status.pending;
  }
  if (txReceipt.status === 1) {
    return status.success;
  }
  return status.failed;
};

module.exports.withTokenFeeValue = (txReceipt, feeData) => {
  if (!txReceipt) return;

  const tokenFee = txReceipt.logs
    .map((log) => {
      if (feeData.tokenAddress !== log.address) return undefined;
      return contracts.Erc20.interface.parseLog(log);
    })
    .filter(Boolean)
    .reduce((prev, curr) => {
      if (curr.signature === eventSignatures.erc20Transfer && curr.args[1] === web3.paymaster) {
        return prev.add(curr.args[2]);
      }

      return prev;
    }, ethers.constants.Zero);

  return {
    ...feeData,
    value: tokenFee.toString(),
  };
};

module.exports.isWalletDeployed = async (walletAddress) => wallet.proxy.isCodeDeployed(provider, walletAddress);

module.exports.recoverAddressFromLoginSignature = (signature) => ethers.utils.verifyMessage(loginMessage, signature);

module.exports.walletContract = (walletAddress) => contracts.Wallet.getInstance(provider).attach(walletAddress);

module.exports.getERC20TokenMeta = async (address) => {
  const token = contracts.Erc20.getInstance(address, provider);
  const [units, symbol] = await Promise.all([token.decimals(), token.symbol()]);
  const prefix = address === web3.usdc ? '$' : undefined;
  const suffix = address === web3.usdc ? undefined : symbol;
  return { units, prefix, suffix, tokenAddress: address };
};

module.exports.formatERC20Value = (tokenMeta, value) => {
  return `${tokenMeta.prefix ? `${tokenMeta.prefix}` : ''}${ethers.utils.formatUnits(value, tokenMeta.units)}${
    tokenMeta.suffix ? ` ${tokenMeta.suffix}` : ''
  }`;
};

module.exports.signatureCount = (userOp) => {
  const ws =
    userOp.signature !== constants.userOperations.nullCode
      ? ethers.utils.defaultAbiCoder.decode(['uint8', '(address signer, bytes signature)[]'], userOp.signature)
      : [undefined, []];

  return ws[1].length;
};
