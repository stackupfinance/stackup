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
exports.userOperations = exports.proxy = exports.message = exports.encodeFunctionData = exports.decodeCallData = exports.access = exports.createRandom = exports.reencryptSigner = exports.decryptSigner = exports._overrideScryptFn = void 0;
const ethers_1 = require("ethers");
const aes_1 = __importDefault(require("crypto-js/aes"));
const enc_utf8_1 = __importDefault(require("crypto-js/enc-utf8"));
const scrypt_js_1 = __importDefault(require("scrypt-js"));
const Wallet = __importStar(require("../contracts/wallet"));
const proxy = __importStar(require("./proxy"));
// @ts-ignore
const buffer = require("scrypt-js/thirdparty/buffer");
require("scrypt-js/thirdparty/setImmediate");
let _scryptFn = scrypt_js_1.default.scrypt;
const _overrideScryptFn = (fn) => {
    _scryptFn = fn;
};
exports._overrideScryptFn = _overrideScryptFn;
const _generatePasswordKey = async (password, salt) => {
    const N = 16384, r = 8, p = 1, dkLen = 32;
    const passwordBuffer = new buffer.SlowBuffer(password.normalize("NFKC"));
    const saltBuffer = new buffer.SlowBuffer(salt.normalize("NFKC"));
    return _scryptFn(passwordBuffer, saltBuffer, N, r, p, dkLen);
};
const decryptSigner = async (wallet, password, salt) => {
    try {
        const passwordKey = await _generatePasswordKey(password, salt);
        const privateKey = aes_1.default.decrypt(wallet.encryptedSigner, Buffer.from(passwordKey).toString("hex")).toString(enc_utf8_1.default);
        if (!ethers_1.ethers.utils.isBytesLike(privateKey))
            return;
        return new ethers_1.ethers.Wallet(privateKey);
    }
    catch (error) {
        if (error.message !== "Malformed UTF-8 data") {
            throw error;
        }
    }
};
exports.decryptSigner = decryptSigner;
const reencryptSigner = async (wallet, password, newPassword, salt) => {
    try {
        const passwordKey = await _generatePasswordKey(password, salt);
        const privateKey = aes_1.default.decrypt(wallet.encryptedSigner, Buffer.from(passwordKey).toString("hex")).toString(enc_utf8_1.default);
        if (!privateKey)
            return;
        const newPasswordKey = await _generatePasswordKey(newPassword, salt);
        return aes_1.default.encrypt(privateKey, Buffer.from(newPasswordKey).toString("hex")).toString();
    }
    catch (error) {
        if (error.message !== "Malformed UTF-8 data") {
            throw error;
        }
    }
};
exports.reencryptSigner = reencryptSigner;
const createRandom = async (password, salt, opts = {}) => {
    const signer = new ethers_1.ethers.Wallet(ethers_1.ethers.utils.randomBytes(32));
    const initImplementation = Wallet.address;
    const initOwner = signer.address;
    const initGuardians = opts.guardians ?? [];
    const walletAddress = proxy.getAddress(initImplementation, initOwner, initGuardians);
    const passwordKey = await _generatePasswordKey(password, salt);
    return {
        walletAddress,
        initImplementation,
        initOwner,
        initGuardians,
        salt,
        encryptedSigner: aes_1.default.encrypt(signer.privateKey, Buffer.from(passwordKey).toString("hex")).toString(),
    };
};
exports.createRandom = createRandom;
exports.access = __importStar(require("./access"));
exports.decodeCallData = __importStar(require("./decodeCallData"));
exports.encodeFunctionData = __importStar(require("./encodeFunctionData"));
exports.message = __importStar(require("./message"));
exports.proxy = __importStar(require("./proxy"));
exports.userOperations = __importStar(require("./userOperations"));
