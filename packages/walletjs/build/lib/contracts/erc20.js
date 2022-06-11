"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstance = exports.interface = void 0;
const ethers_1 = require("ethers");
const ERC20_json_1 = __importDefault(require("./source/ERC20.json"));
// @ts-ignore
exports.interface = new ethers_1.ethers.utils.Interface(ERC20_json_1.default.abi);
const getInstance = (tokenAddress, provider) => new ethers_1.ethers.Contract(tokenAddress, ERC20_json_1.default.abi, provider);
exports.getInstance = getInstance;
