// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

import "../UserOperation.sol";
import "../paymaster/PaymasterHelpers.sol";

/**
 * @dev Signatures layout used by the Paymasters and Wallets internally
 * @param mode whether it is an owner's or a guardian's signature
 * @param values list of signatures value to validate
 */
struct SignatureData {
  SignatureMode mode;
  SignatureValue[] values;
}

/**
 * @dev Signature's value layout used by the Paymasters and Wallets internally
 * @param signer address of the owner or guardian signing the data
 * @param signature data signed
 */
struct SignatureValue {
  address signer;
  bytes signature;
}

/**
 * @dev Signature mode to denote whether it is an owner's or a guardian's signature
 */
enum SignatureMode {
  owner,
  guardians
}

/**
 * @dev Signatures helpers library
 */
library Signatures {
  using PaymasterHelpers for UserOperation;

  /**
   * @dev Decodes a user operation's signature assuming the expected layout defined by the Signatures library
   */
  function decodeSignature(UserOperation calldata op) internal pure returns (SignatureData memory) {
    return decodeSignature(op.signature);
  }

  /**
   * @dev Decodes a paymaster's signature assuming the expected layout defined by the Signatures library
   */
  function decodePaymasterSignature(UserOperation calldata op) internal pure returns (SignatureData memory) {
    PaymasterData memory paymasterData = op.decodePaymasterData();
    return decodeSignature(paymasterData.signature);
  }

  /**
   * @dev Decodes a signature assuming the expected layout defined by the Signatures library
   */
  function decodeSignature(bytes memory signature) internal pure returns (SignatureData memory) {
    (SignatureMode mode, SignatureValue[] memory values) = abi.decode(signature, (SignatureMode, SignatureValue[]));
    return SignatureData(mode, values);
  }
}
