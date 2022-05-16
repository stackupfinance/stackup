// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @dev Gas helpers library
 */
library GasUsed {
  using SafeMath for uint256;

  /**
   * @dev Tells the gas used based on a previous gas-left measure
   */
  function since(uint256 previousGasLeft) internal view returns (uint256 gasUsed) {
    return previousGasLeft.sub(gasleft(), "Invalid previous gas left");
  }
}
