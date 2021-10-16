// Based on https://eips.ethereum.org/EIPS/eip-4337

// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

struct UserOperation {
  address sender;
  uint256 nonce;
  bytes initCode;
  // bytes callData;
  // uint256 callGas;
  // uint256 verificationGas;
  // uint256 preVerificationGas;
  // uint256 maxFeePerGas;
  // uint256 maxPriorityFeePerGas;
  // address paymaster;
  // bytes paymasterData;
  // bytes signature;
}
