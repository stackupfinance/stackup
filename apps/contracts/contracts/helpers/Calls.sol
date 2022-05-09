// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

import "@openzeppelin/contracts/utils/Address.sol";

/**
 * @dev Calls helpers library
 */
library Calls {
  // solhint-disable avoid-low-level-calls

  /**
   * @dev Sends `value` wei to `recipient`, forwarding all available gas and reverting on errors.
   * If `recipient` reverts with a revert reason, it is bubbled. Otherwise, it reverts with `errorMessage`.
   */
  function sendValue(
    address payable recipient,
    uint256 value,
    string memory errorMessage
  ) internal {
    require(address(this).balance >= value, "Address: insufficient balance");
    (bool success, bytes memory returndata) = recipient.call{ value: value }("");
    Address.verifyCallResult(success, returndata, errorMessage);
  }

  /**
   * @dev Performs a Solidity function call using a low level `call` sending `value` wei to `recipient`,
   * forwarding all available gas and reverting on errors.
   * If `target` reverts with a revert reason, it is bubbled up. Otherwise, it reverts with `errorMessage`.
   */
  function callWithValue(
    address target,
    bytes memory data,
    uint256 value,
    string memory errorMessage
  ) internal {
    if (data.length == 0) {
      sendValue(payable(address(target)), value, errorMessage);
    } else {
      Address.functionCallWithValue(target, data, value, errorMessage);
    }
  }
}
