// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../wallet/Wallet.sol";

contract WalletV2Mock is Wallet {
  uint256 public x;

  function setX(uint256 _x) external {
    require(x == 0, "ERR_WALLET_V2_INITIALIZED");
    x = _x;
  }
}
