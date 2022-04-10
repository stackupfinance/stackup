// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.0;

import "../UserOperation.sol";
import "./IEntryPointStaking.sol";

/**
 * @dev EntryPoint interface specified in https://eips.ethereum.org/EIPS/eip-4337
 */
interface IEntryPoint is IEntryPointStaking {
  function handleOps(UserOperation[] calldata ops, address payable redeemer) external;

  // function simulateWalletValidation(UserOperation calldata op)
  //   external
  //   returns (uint256 gasUsedByPayForSelfOp);

  // function simulatePaymasterValidation(
  //   UserOperation calldata op,
  //   uint256 gasUsedByPayForSelfOp
  // ) external view returns (bytes memory context, uint256 gasUsedByPayForOp);
}
