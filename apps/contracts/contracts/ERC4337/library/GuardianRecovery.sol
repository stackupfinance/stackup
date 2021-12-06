// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

struct GuardianRecovery {
  address guardian;
  address wallet;
  address newOwner;
  bytes signature;
}
