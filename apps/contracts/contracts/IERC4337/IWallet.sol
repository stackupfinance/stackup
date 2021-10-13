// Based on https://eips.ethereum.org/EIPS/eip-4337

// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "./UserOperation.sol";

interface IWallet {
  function validateUserOp(
    UserOperation calldata userOp,
    uint256 requiredPrefund
  ) external;
}
