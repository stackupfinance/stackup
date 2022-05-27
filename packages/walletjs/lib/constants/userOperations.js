const { ethers } = require("ethers");

const _defaultGas = 215000;
const _defaultMaxFee = 50000000000; // 50 Gwei
const _initNonce = 0;
const _nullCode = "0x";

module.exports.defaultGas = _defaultGas;
module.exports.defaultMaxFee = _defaultMaxFee;
module.exports.defaultMaxPriorityFee = _defaultMaxFee;
module.exports.initNonce = _initNonce;
module.exports.nullCode = _nullCode;

module.exports.defaults = {
  nonce: _initNonce,
  initCode: _nullCode,
  callData: _nullCode,
  callGas: _defaultGas,
  verificationGas: _defaultGas,
  preVerificationGas: _defaultGas,
  maxFeePerGas: _defaultMaxFee,
  maxPriorityFeePerGas: _defaultMaxFee,
  paymaster: ethers.constants.AddressZero,
  paymasterData: _nullCode,
  signature: _nullCode,
};
