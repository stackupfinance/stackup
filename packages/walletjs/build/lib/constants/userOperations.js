"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaults = exports.nullCode = exports.initNonce = exports.defaultMaxPriorityFee = exports.defaultMaxFee = exports.defaultGas = void 0;
const ethers_1 = require("ethers");
const _defaultGas = 215000;
const _defaultMaxFee = 50000000000; // 50 Gwei
const _initNonce = 0;
const _nullCode = "0x";
exports.defaultGas = _defaultGas;
exports.defaultMaxFee = _defaultMaxFee;
exports.defaultMaxPriorityFee = _defaultMaxFee;
exports.initNonce = _initNonce;
exports.nullCode = _nullCode;
exports.defaults = {
    sender: ethers_1.ethers.constants.AddressZero,
    nonce: _initNonce,
    initCode: _nullCode,
    callData: _nullCode,
    callGas: _defaultGas,
    verificationGas: _defaultGas,
    preVerificationGas: _defaultGas,
    maxFeePerGas: _defaultMaxFee,
    maxPriorityFeePerGas: _defaultMaxFee,
    paymaster: ethers_1.ethers.constants.AddressZero,
    paymasterData: _nullCode,
    signature: _nullCode,
};
