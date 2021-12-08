const { ethers } = require("ethers");
const SingletonFactory = require("../contracts/singletonFactory");
const wallet = require("../contracts/wallet");
const { factory } = require("../contracts/walletProxy");
const { nullCode, initNonce } = require("../constants/userOperations");
const { initialize } = require("./encodeFunctionData");

module.exports.isCodeDeployed = async (provider, walletAddress) => {
  const code = await provider.getCode(walletAddress);

  return code !== nullCode;
};

module.exports.getAddress = (
  initImplementation,
  initEntryPoint,
  initOwner,
  initGuardians
) => {
  return ethers.utils.getCreate2Address(
    SingletonFactory.address,
    ethers.utils.formatBytes32String(initNonce),
    ethers.utils.keccak256(
      this.getInitCode(
        initImplementation,
        initEntryPoint,
        initOwner,
        initGuardians
      )
    )
  );
};

module.exports.getInitCode = (
  initImplementation,
  initEntryPoint,
  initOwner,
  initGuardians
) => {
  return factory.getDeployTransaction(
    initImplementation,
    initialize(initEntryPoint, initOwner, initGuardians)
  ).data;
};

module.exports.getNonce = async (provider, walletAddress) => {
  const w = wallet.getInstance(provider).attach(walletAddress);
  return w.nonce().then((nonce) => nonce.toNumber());
};
