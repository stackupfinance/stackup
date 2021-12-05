const { ethers } = require("ethers");
const { initialize } = require("./encodeFunctionData");
const WalletProxyContract = require("../../artifacts/contracts/ERC4337/WalletProxy.sol/WalletProxy.json");

const WALLET_PROXY = new ethers.ContractFactory(
  WalletProxyContract.abi,
  WalletProxyContract.bytecode
);

module.exports.getInitCode = (implementation, entryPoint, owner, guardians) => {
  return WALLET_PROXY.getDeployTransaction(
    implementation,
    initialize(entryPoint, owner, guardians)
  ).data;
};
