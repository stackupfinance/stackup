// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import {GuardianRecovery} from "./GuardianRecovery.sol";

library WalletGuardianRecovery {
  using ECDSA for bytes32;

  function hasValidSignature(GuardianRecovery calldata recovery)
    internal
    view
    returns (bool)
  {
    return
      SignatureChecker.isValidSignatureNow(
        recovery.guardian,
        keccak256(
          abi.encodePacked(
            recovery.guardian,
            recovery.wallet,
            recovery.newOwner
          )
        ).toEthSignedMessageHash(),
        recovery.signature
      );
  }
}
