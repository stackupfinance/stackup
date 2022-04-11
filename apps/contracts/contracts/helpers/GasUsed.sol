// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @dev Gas helpers library
 */
library GasUsed {
  using SafeMath for uint256;

  function since(uint256 previousGasLeft) internal view returns (uint256 gasUsed) {
    return previousGasLeft.sub(gasleft(), "Invalid previous gas left");
  }
}
