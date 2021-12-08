const { ethers } = require("ethers");
const {
  initNonce,
  nullCode,
  defaultGas,
  defaultMaxFee,
  defaultMaxPriorityFee,
} = require("../constants/userOperations");
const message = require("./message");

module.exports.get = (sender, override = {}) => {
  return {
    sender,
    nonce: initNonce,
    initCode: nullCode,
    callData: nullCode,
    callGas: defaultGas,
    verificationGas: defaultGas,
    preVerificationGas: defaultGas,
    maxFeePerGas: defaultMaxFee,
    maxPriorityFeePerGas: defaultMaxPriorityFee,
    paymaster: ethers.constants.AddressZero,
    paymasterData: nullCode,
    signature: nullCode,
    ...override,
  };
};

module.exports.sign = async (signer, op) => {
  return {
    ...op,
    signature: await signer.signMessage(message.userOperation(op)),
  };
};
