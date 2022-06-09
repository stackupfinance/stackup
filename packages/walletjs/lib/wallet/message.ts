import { BigNumberish, ethers } from "ethers";
import { IUserOperation } from "../constants/userOperations";

const _userOperation = (op: IUserOperation) => {
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

export const paymasterData = (
  op: IUserOperation,
  paymasterFee: BigNumberish,
  erc20Token: string,
  priceFeed: string
) => {
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

export const userOperation = _userOperation;

export const requestId = (
  op: IUserOperation,
  entryPoint: string,
  chainId: BigNumberish
) => {
  return ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(
      ["bytes32", "address", "uint"],
      [_userOperation(op), entryPoint, chainId]
    )
  );
};
