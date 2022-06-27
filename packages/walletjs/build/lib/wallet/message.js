"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestId = exports.userOperation = exports.paymasterData = exports.PaymasterMode = void 0;
const ethers_1 = require("ethers");
var PaymasterMode;
(function (PaymasterMode) {
    PaymasterMode[PaymasterMode["FULL"] = 0] = "FULL";
    PaymasterMode[PaymasterMode["FEE_ONLY"] = 1] = "FEE_ONLY";
    PaymasterMode[PaymasterMode["GAS_ONLY"] = 2] = "GAS_ONLY";
    PaymasterMode[PaymasterMode["FREE"] = 3] = "FREE";
})(PaymasterMode = exports.PaymasterMode || (exports.PaymasterMode = {}));
const _userOperation = (op) => {
    return ethers_1.ethers.utils.keccak256(ethers_1.ethers.utils.solidityPack([
        "address",
        "uint256",
        "bytes32",
        "bytes32",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
        "address",
        "bytes32",
    ], [
        op.sender,
        op.nonce,
        ethers_1.ethers.utils.keccak256(op.initCode),
        ethers_1.ethers.utils.keccak256(op.callData),
        op.callGas,
        op.verificationGas,
        op.preVerificationGas,
        op.maxFeePerGas,
        op.maxPriorityFeePerGas,
        op.paymaster,
        ethers_1.ethers.utils.keccak256(op.paymasterData),
    ]));
};
const paymasterData = (op, fee, mode, token, feed) => {
    return ethers_1.ethers.utils.arrayify(ethers_1.ethers.utils.keccak256(ethers_1.ethers.utils.solidityPack([
        "address",
        "uint256",
        "bytes32",
        "bytes32",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
        "address",
        "bytes32",
    ], [
        op.sender,
        op.nonce,
        ethers_1.ethers.utils.keccak256(op.initCode),
        ethers_1.ethers.utils.keccak256(op.callData),
        op.callGas,
        op.verificationGas,
        op.preVerificationGas,
        op.maxFeePerGas,
        op.maxPriorityFeePerGas,
        op.paymaster,
        // Hash all paymasterData together
        ethers_1.ethers.utils.keccak256(ethers_1.ethers.utils.solidityPack(["uint256", "uint8", "address", "address"], [fee, mode, token, feed])),
    ])));
};
exports.paymasterData = paymasterData;
exports.userOperation = _userOperation;
const requestId = (op, entryPoint, chainId) => {
    return ethers_1.ethers.utils.keccak256(ethers_1.ethers.utils.defaultAbiCoder.encode(["bytes32", "address", "uint"], [_userOperation(op), entryPoint, chainId]));
};
exports.requestId = requestId;
