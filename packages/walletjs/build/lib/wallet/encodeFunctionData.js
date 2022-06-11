"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upgradeTo = exports.addEntryPointStake = exports.revokeGuardian = exports.grantGuardian = exports.transferOwner = exports.initialize = exports.executeUserOp = exports.ERC20Transfer = exports.ERC20Approve = void 0;
const ethers_1 = require("ethers");
const ERC20 = __importStar(require("../contracts/erc20"));
const EntryPoint = __importStar(require("../contracts/entryPoint"));
const Wallet = __importStar(require("../contracts/wallet"));
const userOperations = __importStar(require("../constants/userOperations"));
const staking = __importStar(require("../constants/staking"));
const ERC20Approve = (tokenAddress, spender, value) => {
    return Wallet.interface.encodeFunctionData("executeUserOp", [
        tokenAddress,
        0,
        ERC20.interface.encodeFunctionData("approve", [spender, value]),
    ]);
};
exports.ERC20Approve = ERC20Approve;
const ERC20Transfer = (tokenAddress, to, value) => {
    return Wallet.interface.encodeFunctionData("executeUserOp", [
        tokenAddress,
        0,
        ERC20.interface.encodeFunctionData("transfer", [to, value]),
    ]);
};
exports.ERC20Transfer = ERC20Transfer;
const executeUserOp = (to, value, data) => {
    return Wallet.interface.encodeFunctionData("executeUserOp", [
        to,
        value ?? ethers_1.ethers.constants.Zero,
        data ?? userOperations.nullCode,
    ]);
};
exports.executeUserOp = executeUserOp;
const initialize = (owner, guardians) => {
    return Wallet.interface.encodeFunctionData("initialize", [owner, guardians]);
};
exports.initialize = initialize;
const transferOwner = (newOwner) => {
    return Wallet.interface.encodeFunctionData("transferOwner", [newOwner]);
};
exports.transferOwner = transferOwner;
const grantGuardian = (guardian) => {
    return Wallet.interface.encodeFunctionData("grantGuardian", [guardian]);
};
exports.grantGuardian = grantGuardian;
const revokeGuardian = (guardian) => {
    return Wallet.interface.encodeFunctionData("revokeGuardian", [guardian]);
};
exports.revokeGuardian = revokeGuardian;
const addEntryPointStake = (value) => {
    return Wallet.interface.encodeFunctionData("executeUserOp", [
        EntryPoint.address,
        typeof value === "string"
            ? ethers_1.ethers.utils.parseEther(value)
            : ethers_1.ethers.BigNumber.from(value),
        EntryPoint.interface.encodeFunctionData("addStake", [
            ethers_1.ethers.BigNumber.from(staking.default_unlock_delay_sec),
        ]),
    ]);
};
exports.addEntryPointStake = addEntryPointStake;
const upgradeTo = (newImplementation) => {
    return Wallet.interface.encodeFunctionData("upgradeTo", [newImplementation]);
};
exports.upgradeTo = upgradeTo;
