"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstance = exports.address = void 0;
const ethers_1 = require("ethers");
const ABI = [
    {
        constant: false,
        inputs: [
            {
                internalType: "bytes",
                name: "_initCode",
                type: "bytes",
            },
            {
                internalType: "bytes32",
                name: "_salt",
                type: "bytes32",
            },
        ],
        name: "deploy",
        outputs: [
            {
                internalType: "address payable",
                name: "createdContract",
                type: "address",
            },
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
];
const _address = "0xce0042B868300000d44A59004Da54A005ffdcf9f";
exports.address = _address;
const getInstance = (signer) => {
    return new ethers_1.ethers.Contract(_address, ABI, signer);
};
exports.getInstance = getInstance;
