import { ethers } from "ethers";

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

export const address = _address;

export const getInstance = (signer: ethers.Signer) => {
  return new ethers.Contract(_address, ABI, signer);
};
