// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

contract Reverter {
  function fail() external pure {
    revert("REVERTED");
  }
}
