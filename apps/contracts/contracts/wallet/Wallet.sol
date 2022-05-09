// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "./IWallet.sol";
import "./WalletHelpers.sol";
import "../UserOperation.sol";
import "../helpers/Calls.sol";
import "../helpers/Signatures.sol";
import "../helpers/UpgradeableACL.sol";
import "../paymaster/Paymaster.sol";
import "../paymaster/PaymasterHelpers.sol";

contract Wallet is IWallet, UpgradeableACL, Paymaster {
  using ECDSA for bytes32;
  using Calls for address;
  using Calls for address payable;
  using Signatures for UserOperation;
  using WalletHelpers for UserOperation;

  uint256 public nonce;

  constructor(address entryPoint) Paymaster(entryPoint) {
    // solhint-disable-previous-line no-empty-blocks
  }

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

    SignatureData memory signatureData = op.decodeSignature();
    signatureData.mode == SignatureMode.owner
      ? _validateOwnerSignature(signatureData, requestId)
      : _validateGuardiansSignature(signatureData, op, requestId);

    if (requiredPrefund > 0) {
      payable(entryPoint).sendValue(requiredPrefund, "Wallet: Failed to prefund");
    }
  }

  function _validateOwnerSignature(SignatureData memory signatureData, bytes32 requestId) internal view {
    SignatureValue memory value = signatureData.values[0];
    _validateOwnerSignature(value.signer, requestId.toEthSignedMessageHash(), value.signature);
  }

  function _validateGuardiansSignature(
    SignatureData memory signatureData,
    UserOperation calldata op,
    bytes32 requestId
  ) internal view {
    require(getGuardiansCount() > 0, "Wallet: No guardians allowed");
    require(op.isGuardianActionAllowed(), "Wallet: Invalid guardian action");
    require(signatureData.values.length >= getMinGuardiansSignatures(), "Wallet: Insufficient guardians");

    for (uint256 i = 0; i < signatureData.values.length; i++) {
      SignatureValue memory value = signatureData.values[i];
      _validateGuardianSignature(value.signer, requestId.toEthSignedMessageHash(), value.signature);
    }
  }
}
