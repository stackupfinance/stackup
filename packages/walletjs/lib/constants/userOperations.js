const { ethers } = require('ethers');

module.exports.defaultGas = 215000;
module.exports.defaultMaxFee = 50000000000;
module.exports.defaultMaxPriorityFee = this.defaultMaxFee;
module.exports.initNonce = 0;
module.exports.nullCode = '0x';

module.exports.defaults = {
  nonce: this.initNonce,
  initCode: this.nullCode,
  callData: this.nullCode,
  callGas: this.defaultGas,
  verificationGas: this.defaultGas,
  preVerificationGas: this.defaultGas,
  maxFeePerGas: this.defaultMaxFee,
  maxPriorityFeePerGas: this.defaultMaxPriorityFee,
  paymaster: ethers.constants.AddressZero,
  paymasterData: this.nullCode,
  signature: this.nullCode,
};
