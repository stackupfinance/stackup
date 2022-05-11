// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenMock is ERC20 {
  uint8 internal _decimals;

  constructor(string memory symbol, uint8 decimals_) ERC20(symbol, symbol) {
    _decimals = decimals_;
  }

  function decimals() public view override returns (uint8) {
    return _decimals;
  }

  function mint(address account, uint256 amount) external {
    _mint(account, amount);
  }
}
