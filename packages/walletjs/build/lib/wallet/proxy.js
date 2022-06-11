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
exports.getNonce = exports.getInitCode = exports.getAddress = exports.isCodeDeployed = void 0;
const ethers_1 = require("ethers");
const SingletonFactory = __importStar(require("../contracts/singletonFactory"));
const Wallet = __importStar(require("../contracts/wallet"));
const walletProxy = __importStar(require("../contracts/walletProxy"));
const userOperation = __importStar(require("../constants/userOperations"));
const encodeFunctionData = __importStar(require("./encodeFunctionData"));
const _getInitCode = (initImplementation, initOwner, initGuardians) => {
    return (walletProxy.factory.getDeployTransaction(initImplementation, encodeFunctionData.initialize(initOwner, initGuardians)).data || userOperation.nullCode);
};
const _getAddress = (initImplementation, initOwner, initGuardians) => {
    return ethers_1.ethers.utils.getCreate2Address(SingletonFactory.address, ethers_1.ethers.utils.formatBytes32String(String.fromCharCode(userOperation.initNonce)), ethers_1.ethers.utils.keccak256(_getInitCode(initImplementation, initOwner, initGuardians)));
};
const isCodeDeployed = async (provider, walletAddress) => {
    const code = await provider.getCode(walletAddress);
    return code !== userOperation.nullCode;
};
exports.isCodeDeployed = isCodeDeployed;
exports.getAddress = _getAddress;
exports.getInitCode = _getInitCode;
const getNonce = async (provider, walletAddress) => {
    const w = Wallet.getInstance(provider).attach(walletAddress);
    return w.nonce().then((nonce) => nonce.toNumber());
};
exports.getNonce = getNonce;
