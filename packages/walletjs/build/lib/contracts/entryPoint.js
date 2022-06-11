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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstance = exports.interface = exports.address = exports.deployInitCode = exports.deploySalt = void 0;
const ethers_1 = require("ethers");
const SingletonFactory = __importStar(require("./singletonFactory"));
const EntryPoint_json_1 = __importDefault(require("./source/EntryPoint.json"));
const constants_1 = require("../constants");
const _deployInitCode = new ethers_1.ethers.ContractFactory(EntryPoint_json_1.default.abi, EntryPoint_json_1.default.bytecode).getDeployTransaction(SingletonFactory.address, constants_1.staking.default_unlock_delay_sec).data;
if (!_deployInitCode) {
    throw new Error("_deployInitCode not initialized");
}
const _deploySalt = ethers_1.ethers.utils.formatBytes32String(String.fromCharCode(0));
const _address = ethers_1.ethers.utils.getCreate2Address(SingletonFactory.address, _deploySalt, ethers_1.ethers.utils.keccak256(_deployInitCode));
exports.deploySalt = _deploySalt;
exports.deployInitCode = _deployInitCode;
exports.address = _address;
// @ts-ignore
exports.interface = new ethers_1.ethers.utils.Interface(EntryPoint_json_1.default.abi);
const getInstance = (signerOrProvider) => new ethers_1.ethers.Contract(_address, EntryPoint_json_1.default.abi, signerOrProvider);
exports.getInstance = getInstance;
