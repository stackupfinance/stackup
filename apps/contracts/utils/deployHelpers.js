const SINGLETON_FACTORY_ABI = [
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
const SINGLETON_FACTORY_ADDRESS = "0xce0042B868300000d44A59004Da54A005ffdcf9f";

module.exports = {
  SINGLETON_FACTORY_ABI,
  SINGLETON_FACTORY_ADDRESS,
};
