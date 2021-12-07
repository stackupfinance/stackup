const { ethers } = require("ethers");

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
const ADDRESS = "0xce0042B868300000d44A59004Da54A005ffdcf9f";

module.exports.address = ADDRESS;

module.exports.getContract = (signer) => {
  return new ethers.Contract(ADDRESS, ABI, signer);
};
