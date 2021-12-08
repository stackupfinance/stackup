const { ethers } = require("ethers");
const SingletonFactory = require("../contracts/singletonFactory");
const { factory } = require("../contracts/walletProxy");
const { initialize } = require("./encodeFunctionData");

module.exports.initNonce = 0;

module.exports.getAddress = (
  initImplementation,
  initEntryPoint,
  initOwner,
  initGuardians
) => {
  return ethers.utils.getCreate2Address(
    SingletonFactory.address,
    ethers.utils.formatBytes32String(this.initNonce),
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
