const { ethers } = require("ethers");
const source =
  process.env.NODE_ENV === "test"
    ? require("../../artifacts/contracts/ERC4337/WalletProxy.sol/WalletProxy.json")
    : require("./source/WalletProxy.json");

module.exports.factory = new ethers.ContractFactory(
  source.abi,
  source.bytecode
);
