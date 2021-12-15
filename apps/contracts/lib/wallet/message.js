const { ethers } = require("ethers");

module.exports.guardianRecovery = (data) => {
  return ethers.utils.arrayify(
    ethers.utils.keccak256(
      ethers.utils.solidityPack(
        ["address", "address", "address"],
        [data.guardian, data.wallet, data.newOwner]
      )
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

module.exports.userOperation = (op) => {
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
          ethers.utils.keccak256(op.paymasterData),
        ]
      )
    )
  );
};
