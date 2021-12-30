// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

enum WalletSignatureMode {
  owner,
  guardians
}

struct WalletSignatureValue {
  address signer;
  bytes signature;
}

struct WalletSignature {
  WalletSignatureMode mode;
  WalletSignatureValue[] values;
}
