// SPDX-License-Identifier: AGPL-3.0

pragma solidity 0.8.9;

import "../UserOperation.sol";

/**
 * @dev Mode used to denote the paymaster the status of the operation for the post-op process
 * @param opSucceeded to denote the user op succeeded
 * @param opReverted to denote the user op reverted
 * @param postOpReverted to denote the post-op was already tried and it reverted
 */
enum PostOpMode {
  opSucceeded,
  opReverted,
  postOpReverted
}

/**
 * @dev Paymaster interface specified in https://eips.ethereum.org/EIPS/eip-4337
 */
interface IPaymaster {
  function validatePaymasterUserOp(
    UserOperation calldata op,
    bytes32 requestId,
    uint256 maxCost
  ) external view returns (bytes memory context);

  function postOp(
    PostOpMode mode,
    bytes calldata context,
    uint256 actualGasCost
  ) external;
}
