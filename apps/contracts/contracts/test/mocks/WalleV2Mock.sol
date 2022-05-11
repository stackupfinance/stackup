// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

import "../../wallet/Wallet.sol";

contract WalletV2Mock is Wallet {
  uint256 public x;

  constructor(address entryPoint) Wallet(entryPoint) {
    // solhint-disable-previous-line no-empty-blocks
  }

  function setX(uint256 _x) external {
    require(x == 0, "WALLET_V2_INITIALIZED");
    x = _x;
  }
}
