const { ethers } = require("hardhat");

const NULL_CODE = "0x";

const getUserOperation = (override = {}) => {
  return {
    nonce: 0,
    initCode: NULL_CODE,
    ...override,
  };
};

const getWalletAddress = (from, nonce, initCode) => {
  return ethers.utils.getCreate2Address(
    from,
    ethers.utils.formatBytes32String(nonce),
    ethers.utils.keccak256(initCode)
  );
};

const isWalletDeployed = async (address) => {
  const [addr] = await ethers.getSigners();
  const code = await addr.provider.getCode(address);

  return code !== NULL_CODE;
};

module.exports = {
  NULL_CODE,
  getUserOperation,
  getWalletAddress,
  isWalletDeployed,
};
