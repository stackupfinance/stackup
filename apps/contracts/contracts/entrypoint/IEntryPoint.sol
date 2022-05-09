// SPDX-License-Identifier: AGPL-3.0

pragma solidity 0.8.9;

import "../UserOperation.sol";
import "./IEntryPointStaking.sol";

/**
 * @dev EntryPoint interface specified in https://eips.ethereum.org/EIPS/eip-4337
 */
interface IEntryPoint is IEntryPointStaking {
  function simulateValidation(UserOperation calldata userOp) external returns (uint256 preOpGas, uint256 prefund);

  function handleOps(UserOperation[] calldata ops, address payable redeemer) external;
}
