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
exports.signPaymasterData = exports.signAsGuardian = exports.sign = exports.get = exports.appendGuardianSignature = void 0;
const ethers_1 = require("ethers");
const EntryPoint = __importStar(require("../contracts/entryPoint"));
const userOperations = __importStar(require("../constants/userOperations"));
const message = __importStar(require("./message"));
const appendGuardianSignature = (userOp, signedUserOp) => {
    const ws1 = userOp.signature !== userOperations.nullCode
        ? ethers_1.ethers.utils.defaultAbiCoder.decode(["uint8", "(address signer, bytes signature)[]"], userOp.signature)
        : [undefined, []];
    const ws2 = ethers_1.ethers.utils.defaultAbiCoder.decode(["uint8", "(address signer, bytes signature)[]"], signedUserOp.signature);
    const signatureSet = new Set([]);
    const walletSignatureValues = [
        ...ws1[1].map((v) => ({ signer: v.signer, signature: v.signature })),
        ...ws2[1].map((v) => ({ signer: v.signer, signature: v.signature })),
    ].filter((v) => {
        if (signatureSet.has(v.signer))
            return false;
        signatureSet.add(v.signer);
        return true;
    });
    return {
        ...userOp,
        signature: ethers_1.ethers.utils.defaultAbiCoder.encode(["uint8", "(address signer, bytes signature)[]"], [1, walletSignatureValues]),
    };
};
exports.appendGuardianSignature = appendGuardianSignature;
const get = (sender, override = {}) => {
    return {
        ...userOperations.defaults,
        sender,
        ...override,
    };
};
exports.get = get;
const sign = async (signer, op) => {
    if (!signer.provider) {
        throw new Error("No provider connected");
    }
    const walletSignatureValues = [
        {
            signer: await signer.getAddress(),
            signature: await signer.signMessage(ethers_1.ethers.utils.arrayify(message.requestId(op, EntryPoint.address, await signer.provider.getNetwork().then((n) => n.chainId)))),
        },
    ];
    return {
        ...op,
        signature: ethers_1.ethers.utils.defaultAbiCoder.encode(["uint8", "(address signer, bytes signature)[]"], [0, walletSignatureValues]),
    };
};
exports.sign = sign;
const signAsGuardian = async (signer, guardian, op) => {
    const ws = op.signature !== userOperations.nullCode
        ? ethers_1.ethers.utils.defaultAbiCoder.decode(["uint8", "(address signer, bytes signature)[]"], op.signature)
        : [undefined, []];
    const walletSignatureValues = [
        ...ws[1].map((v) => ({ signer: v.signer, signature: v.signature })),
        {
            signer: guardian,
            signature: await signer.signMessage(ethers_1.ethers.utils.arrayify(message.requestId(op, EntryPoint.address, await signer.provider.getNetwork().then((n) => n.chainId)))),
        },
    ];
    return {
        ...op,
        signature: ethers_1.ethers.utils.defaultAbiCoder.encode(["uint8", "(address signer, bytes signature)[]"], [1, walletSignatureValues]),
    };
};
exports.signAsGuardian = signAsGuardian;
const signPaymasterData = async (op, signer, paymaster, paymasterData) => {
    const userOp = { ...op, paymaster };
    return {
        ...userOp,
        paymasterData: ethers_1.ethers.utils.defaultAbiCoder.encode(["uint256", "uint8", "address", "address", "bytes"], [
            paymasterData.fee,
            paymasterData.mode,
            paymasterData.token,
            paymasterData.feed,
            await signer.signMessage(message.paymasterData(userOp, paymasterData.fee, paymasterData.mode, paymasterData.token, paymasterData.feed)),
        ]),
    };
};
exports.signPaymasterData = signPaymasterData;
