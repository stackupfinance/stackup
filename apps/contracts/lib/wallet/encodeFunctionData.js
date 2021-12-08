const { ethers } = require("ethers");
const EntryPoint = require("../contracts/entryPoint");
const Wallet = require("../contracts/wallet");

module.exports.initialize = (entryPoint, owner, guardians) => {
  return Wallet.interface.encodeFunctionData("initialize", [
    entryPoint,
    owner,
    guardians,
  ]);
};

module.exports.recoverAccount = (newOwner, guardianRecoveryArray) => {
  return Wallet.interface.encodeFunctionData("recoverAccount", [
    newOwner,
    guardianRecoveryArray,
  ]);
};

module.exports.addEntryPointStake = (value) => {
  return Wallet.interface.encodeFunctionData("executeUserOp", [
    EntryPoint.address,
    value._isBigNumber ? value : ethers.utils.parseEther(value),
    EntryPoint.interface.encodeFunctionData("addStake"),
  ]);
};

module.exports.lockEntryPointStake = () => {
  return Wallet.interface.encodeFunctionData("executeUserOp", [
    EntryPoint.address,
    0,
    EntryPoint.interface.encodeFunctionData("lockStake"),
  ]);
};
