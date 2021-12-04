// This contract is used for local testing only

// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

contract Test {
  // solhint-disable-next-line no-empty-blocks
  receive() external payable {}

  // solhint-disable-next-line no-empty-blocks
  fallback() external payable {}

  function func(bool value) external pure {
    require(value, "Test: reverted");
  }
}
