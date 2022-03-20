// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract BadRedeemer {
  receive() external payable {
    revert("BAD_REDEEMER");
  }
}
