// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "./IWallet.sol";
import "./WalletHelpers.sol";
import "../UserOperation.sol";
import "../helpers/Calls.sol";
import "../helpers/UpgradeableACL.sol";
import "../paymaster/Paymaster.sol";
import "../paymaster/PaymasterHelpers.sol";

contract Wallet is IWallet, UpgradeableACL, Paymaster {
  using ECDSA for bytes32;
  using Calls for address;
  using Calls for address payable;
  using WalletHelpers for UserOperation;
  using WalletHelpers for WalletSignatureValue;

  uint256 public nonce;

  /**
   * @dev Executes an operation
   * @param to address to be called
   * @param value wei to be sent in the call
   * @param data calldata to be included in the call
   */
  function executeUserOp(
    address to,
    uint256 value,
    bytes calldata data
  ) external override authenticate {
    to.callWithValue(data, value, "Wallet: Execution failed");
  }

  /**
   * @dev Verifies the operation’s signature, and pays the fee if the wallet considers the operation valid
   * @param op operation to be validated
   * @param requestId identifier computed as keccak256(op, entryPoint, chainId)
   * @param requiredPrefund amount to be paid to the entry point in wei, or zero if there is a paymaster involved
   */
  function validateUserOp(
    UserOperation calldata op,
    bytes32 requestId,
    uint256 requiredPrefund
  ) external override authenticate {
    require(nonce++ == op.nonce, "Wallet: Invalid nonce");

    WalletSignature memory walletSignature = op.decodeWalletSignature();
    walletSignature.mode == WalletSignatureMode.owner
      ? _validateOwnerSignature(walletSignature, requestId)
      : _validateGuardiansSignature(walletSignature, op, requestId);

    if (requiredPrefund > 0) {
      payable(entryPoint).sendValue(requiredPrefund, "Wallet: Failed to prefund");
    }
  }

  function _validateOwnerSignature(WalletSignature memory walletSignature, bytes32 requestId) internal view {
    WalletSignatureValue memory value = walletSignature.values[0];
    require(value.isValid(requestId), "Wallet: Invalid owner sig");
    require(isOwner(value.signer), "Wallet: Signer not an owner");
  }

  function _validateGuardiansSignature(
    WalletSignature memory walletSignature,
    UserOperation calldata op,
    bytes32 requestId
  ) internal view {
    require(op.isGuardianActionAllowed(), "Wallet: Invalid guardian action");
    require(walletSignature.values.length >= getMinGuardiansSignatures(), "Wallet: Insufficient guardians");

    for (uint256 i = 0; i < walletSignature.values.length; i++) {
      WalletSignatureValue memory value = walletSignature.values[i];
      require(value.isValid(requestId), "Wallet: Invalid guardian sig");
      require(isGuardian(value.signer), "Wallet: Signer not a guardian");
    }
  }
}
