// SPDX-License-Identifier: AGPL-3.0

pragma solidity 0.8.9;

import "../UserOperation.sol";

/**
 * @dev Wallet interface specified in https://eips.ethereum.org/EIPS/eip-4337
 */
interface IWallet {
  function validateUserOp(
    UserOperation calldata op,
    bytes32 requestId,
    uint256 requiredPrefund
  ) external;

  function executeUserOp(
    address to,
    uint256 value,
    bytes calldata data
  ) external;
}
