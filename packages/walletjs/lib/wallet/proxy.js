const { ethers } = require("ethers");
const SingletonFactory = require("../contracts/singletonFactory");
const Wallet = require("../contracts/wallet");
const walletProxy = require("../contracts/walletProxy");
const userOperation = require("../constants/userOperations");
const encodeFunctionData = require("./encodeFunctionData");

const _getInitCode = (
  initImplementation,
  initEntryPoint,
  initOwner,
  initGuardians
) => {
  return walletProxy.factory.getDeployTransaction(
    initImplementation,
    encodeFunctionData.initialize(initEntryPoint, initOwner, initGuardians)
  ).data;
};

const _getAddress = (
  initImplementation,
  initEntryPoint,
  initOwner,
  initGuardians
) => {
  return ethers.utils.getCreate2Address(
    SingletonFactory.address,
    ethers.utils.formatBytes32String(userOperation.initNonce),
    ethers.utils.keccak256(
      _getInitCode(initImplementation, initEntryPoint, initOwner, initGuardians)
    )
  );
};

module.exports.isCodeDeployed = async (provider, walletAddress) => {
  const code = await provider.getCode(walletAddress);

  return code !== userOperation.nullCode;
};

module.exports.getAddress = _getAddress;

module.exports.getInitCode = _getInitCode;

module.exports.getNonce = async (provider, walletAddress) => {
  const w = Wallet.getInstance(provider).attach(walletAddress);
  return w.nonce().then((nonce) => nonce.toNumber());
};
