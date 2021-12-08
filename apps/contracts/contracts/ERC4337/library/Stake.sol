// Based on https://eips.ethereum.org/EIPS/eip-4337

// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

struct Stake {
  uint256 value;
  uint256 lockExpiryTime;
  bool isLocked;
}
