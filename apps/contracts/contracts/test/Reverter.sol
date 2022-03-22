// SPDX-License-Identifier: agpl-3.0

pragma solidity ^0.8.0;

contract Reverter {
  function fail() external pure {
    revert("REVERTED");
  }
}
