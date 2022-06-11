"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.factory = void 0;
const ethers_1 = require("ethers");
const WalletProxy_json_1 = __importDefault(require("./source/WalletProxy.json"));
exports.factory = new ethers_1.ethers.ContractFactory(WalletProxy_json_1.default.abi, WalletProxy_json_1.default.bytecode);
