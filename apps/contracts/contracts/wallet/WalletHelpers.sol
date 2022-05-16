// SPDX-License-Identifier: AGPL-3.0

pragma solidity 0.8.9;

import "../UserOperation.sol";
import "../helpers/Calldata.sol";
import "../paymaster/PaymasterHelpers.sol";

/**
 * @dev Internal object used to model a wallet execution request
 * @param to target account
 * @param value call value
 * @param data calldata
 */
struct WalletCallData {
  address to;
  uint256 value;
  bytes data;
}

/**
 * @dev Wallet helpers library
 */
library WalletHelpers {
  using Calldata for bytes;
  using PaymasterHelpers for UserOperation;

  /**
   * @dev Guardians can only perform the following actions:
   * 1. Approve token allowance for paymaster
   * 2. Transfer owner for social recovery
   */
  function isGuardianActionAllowed(UserOperation calldata op) internal pure returns (bool) {
    if (op.callData.length == 0) return false;
    return isAllowingTokensForPaymaster(op) || op.callData.isTransferOwner();
  }

  /**
   * @dev Checks if the op's calldata is calling IERC20#approve through IWallet#executeUserOp for the paymaster
   * This function does not check if the approved amount is enough, the paymaster should control that
   */
  function isAllowingTokensForPaymaster(UserOperation calldata op) internal pure returns (bool) {
    if (op.paymasterData.length == 0 || !op.callData.isExecuteUserOp()) return false;

    WalletCallData memory walletCallData = decodeWalletCallData(op);
    if (!walletCallData.data.isERC20Approve()) return false;
    if (walletCallData.to != address(op.decodePaymasterData().token)) return false;
    return op.paymaster == abi.decode(walletCallData.data.params(), (address));
  }

  /**
   * @dev Decodes operation's calldata assuming it is calling IWallet#executeUserOp
   */
  function decodeWalletCallData(UserOperation calldata op) internal pure returns (WalletCallData memory) {
    (address to, uint256 value, bytes memory data) = abi.decode(op.callData.params(), (address, uint256, bytes));
    return WalletCallData(to, value, data);
  }
}
