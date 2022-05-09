// SPDX-License-Identifier: AGPL-3.0

pragma solidity 0.8.9;

/**
 * @dev Operation object specified in https://eips.ethereum.org/EIPS/eip-4337
 */
struct UserOperation {
  address sender;
  uint256 nonce;
  bytes initCode;
  bytes callData;
  uint256 callGas;
  uint256 verificationGas;
  uint256 preVerificationGas;
  uint256 maxFeePerGas;
  uint256 maxPriorityFeePerGas;
  address paymaster;
  bytes paymasterData;
  bytes signature;
}
