const { ethers } = require("ethers");
const WalletContract = require("../../artifacts/contracts/ERC4337/Wallet.sol/Wallet.json");

const WALLET_CONTRACT_INTERFACE = new ethers.utils.Interface(
  WalletContract.abi
);

module.exports.initialize = (entryPoint, owner, guardians) => {
  return WALLET_CONTRACT_INTERFACE.encodeFunctionData("initialize", [
    entryPoint,
    owner,
    guardians,
  ]);
};
