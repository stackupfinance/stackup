// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../paymaster/Paymaster.sol";

contract PaymasterV2Mock is Paymaster {
  uint256 public x;

  function setX(uint256 _x) external {
    require(x == 0, "ERR_PAYMASTER_V2_INITIALIZED");
    x = _x;
  }
}
