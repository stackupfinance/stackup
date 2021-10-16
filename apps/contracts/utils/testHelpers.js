const { ethers } = require("hardhat");

const NULL_CODE = "0x";
const INITIAL_NONCE = 0;

const getUserOperation = (sender, override = {}) => {
  return {
    sender,
    nonce: INITIAL_NONCE,
    initCode: NULL_CODE,
    ...override,
  };
};

const getWalletAddress = (create2factory, initCode) => {
  return ethers.utils.getCreate2Address(
    create2factory,
    ethers.utils.formatBytes32String(INITIAL_NONCE),
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
  INITIAL_NONCE,
  getUserOperation,
  getWalletAddress,
  isWalletDeployed,
};
