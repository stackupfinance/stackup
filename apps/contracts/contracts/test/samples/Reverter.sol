// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Reverter {
  function fail() external pure {
    revert("REVERTED");
  }
}
