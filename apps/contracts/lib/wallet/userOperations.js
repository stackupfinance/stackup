const { ethers } = require("ethers");
const userOperations = require("../constants/userOperations");
const message = require("./message");

module.exports.get = (sender, override = {}) => {
  return {
    sender,
    nonce: userOperations.initNonce,
    initCode: userOperations.nullCode,
    callData: userOperations.nullCode,
    callGas: userOperations.defaultGas,
    verificationGas: userOperations.defaultGas,
    preVerificationGas: userOperations.defaultGas,
    maxFeePerGas: userOperations.defaultMaxFee,
    maxPriorityFeePerGas: userOperations.defaultMaxPriorityFee,
    paymaster: ethers.constants.AddressZero,
    paymasterData: userOperations.nullCode,
    signature: userOperations.nullCode,
    ...override,
  };
};

module.exports.sign = async (signer, op) => {
  return {
    ...op,
    signature: await signer.signMessage(message.userOperation(op)),
  };
};
