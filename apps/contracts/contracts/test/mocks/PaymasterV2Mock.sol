// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

import "../../paymaster/Paymaster.sol";

contract PaymasterV2Mock is Paymaster {
  uint256 public x;

  constructor(address entryPoint) Paymaster(entryPoint) {
    // solhint-disable-previous-line no-empty-blocks
  }

  function setX(uint256 _x) external {
    require(x == 0, "PAYMASTER_V2_INITIALIZED");
    x = _x;
  }
}
