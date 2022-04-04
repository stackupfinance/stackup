// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.5.0) (utils/Address.sol)

pragma solidity ^0.8.1;

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
   * @dev Performs a Solidity function call using a low level `call` with `gas` gas.
   * It the call succeeds, it returns the raw returned data.
   * If `target` reverts with a revert reason, it is bubbled up. Otherwise, it reverts with `errorMessage`.
   */
  function callWithGas(
    address target,
    bytes memory data,
    uint256 gas,
    string memory errorMessage
  ) internal returns (bytes memory) {
    require(Address.isContract(target), "Address: call to non-contract");
    (bool success, bytes memory returndata) = target.call{ gas: gas }(data);
    return Address.verifyCallResult(success, returndata, errorMessage);
  }

  /**
   * @dev Performs a Solidity function call using a low level `call` with `gas` gas.
   * It the call succeeds, it returns the raw returned data.
   * If `target` reverts with a revert reason, it is bubbled up. Otherwise, it reverts with `errorMessage`.
   */
  function callWithValue(
    address target,
    bytes memory data,
    uint256 value,
    string memory errorMessage
  ) internal returns (bytes memory) {
    return Address.functionCallWithValue(target, data, value, errorMessage);
  }
}
