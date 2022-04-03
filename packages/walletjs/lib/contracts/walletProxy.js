const { ethers } = require("ethers");
const source = require("./source/WalletProxy.json");

module.exports.factory = new ethers.ContractFactory(
  source.abi,
  source.bytecode
);
