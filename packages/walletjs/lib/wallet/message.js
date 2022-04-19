const { ethers } = require("ethers");

const _userOperation = (op) => {
  return ethers.utils.keccak256(
    ethers.utils.solidityPack(
      [
        "address",
        "uint256",
        "bytes32",
        "bytes32",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
        "address",
        "bytes32",
      ],
      [
        op.sender,
        op.nonce,
        ethers.utils.keccak256(op.initCode),
        ethers.utils.keccak256(op.callData),
        op.callGas,
        op.verificationGas,
        op.preVerificationGas,
        op.maxFeePerGas,
        op.maxPriorityFeePerGas,
        op.paymaster,
        ethers.utils.keccak256(op.paymasterData),
      ]
    )
  );
};

module.exports.paymasterData = (op, paymasterFee, erc20Token, priceFeed) => {
  return ethers.utils.arrayify(
    ethers.utils.keccak256(
      ethers.utils.solidityPack(
        [
          "address",
          "uint256",
          "bytes32",
          "bytes32",
          "uint256",
          "uint256",
          "uint256",
          "uint256",
          "uint256",
          "address",
          "bytes32",
        ],
        [
          op.sender,
          op.nonce,
          ethers.utils.keccak256(op.initCode),
          ethers.utils.keccak256(op.callData),
          op.callGas,
          op.verificationGas,
          op.preVerificationGas,
          op.maxFeePerGas,
          op.maxPriorityFeePerGas,
          op.paymaster,
          // Hash all paymasterData together
          ethers.utils.keccak256(
            ethers.utils.solidityPack(
              ["uint256", "address", "address"],
              [paymasterFee, erc20Token, priceFeed]
            )
          ),
        ]
      )
    )
  );
};

module.exports.userOperation = _userOperation;

module.exports.requestId = (op, entryPoint, chainId) => {
  return ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(
      ["bytes32", "address", "uint"],
      [_userOperation(op), entryPoint, chainId]
    )
  );
};
