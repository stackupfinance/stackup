// Based on https://eips.ethereum.org/EIPS/eip-4337

// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "../UserOperation.sol";

enum PostOpMode {
  opSucceeded, // user op succeeded
  opReverted, // user op reverted. still has to pay for gas.
  postOpReverted // user op succeeded, but caused postOp to revert
}

interface IPaymaster {
  function validatePaymasterUserOp(
    UserOperation calldata userOp,
    uint256 maxcost
  ) external view returns (bytes memory context);

  function postOp(
    PostOpMode mode,
    bytes calldata context,
    uint256 actualGasCost
  ) external;
}
