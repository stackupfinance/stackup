// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../UserOperation.sol";
import "../paymaster/PaymasterHelpers.sol";

struct SignatureData {
  SignatureMode mode;
  SignatureValue[] values;
}

struct SignatureValue {
  address signer;
  bytes signature;
}

enum SignatureMode {
  owner,
  guardians
}

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
