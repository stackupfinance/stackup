// SPDX-License-Identifier: AGPL-3.0

pragma solidity 0.8.9;

import "../UserOperation.sol";

enum PostOpMode {
  opSucceeded, // user op succeeded
  opReverted, // user op reverted. still has to pay for gas.
  postOpReverted // user op succeeded, but caused postOp to revert
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
