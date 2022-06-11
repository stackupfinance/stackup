"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.magicValue = void 0;
const ethers_1 = require("ethers");
exports.magicValue = new ethers_1.ethers.utils.Interface([
    "function isValidSignature(bytes32 _hash, bytes memory _signature) public view returns (bytes4 magicValue)",
]).getSighash("isValidSignature");
