// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

contract Counter {
  event Incremented(uint256 counter);

  uint256 public counter;

  function increment() external payable {
    emit Incremented(counter++);
  }
}
