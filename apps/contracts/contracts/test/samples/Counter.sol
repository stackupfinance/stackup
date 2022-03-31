// SPDX-License-Identifier: agpl-3.0

pragma solidity ^0.8.0;

contract Counter {
  event Incremented(uint256 counter);

  uint256 public counter;

  function increment() external payable {
    emit Incremented(counter++);
  }
}
