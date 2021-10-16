// Based on https://eips.ethereum.org/EIPS/eip-4337

// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Create2.sol";
import "./interface/IEntryPoint.sol";

import "hardhat/console.sol";

contract EntryPoint is IEntryPoint {
  function _shouldCreateWallet(UserOperation calldata op)
    internal
    view
    returns (bool)
  {
    address wallet = Create2.computeAddress(
      bytes32(op.nonce),
      keccak256(op.initCode)
    );

    if (!Address.isContract(wallet) && op.initCode.length == 0) {
      revert("ERC4337: Null wallet + initCode");
    }

    return !Address.isContract(wallet) && op.initCode.length != 0;
  }

  function handleOps(UserOperation[] calldata ops, address payable redeemer)
    external
  {
    // TODO: What is this used for?
    redeemer;

    uint256 opslen = ops.length;

    // Verification loop
    // 1. Call validateUserOp on the wallet
    // 2. Create the wallet if it does not yet exist
    for (uint256 i = 0; i < opslen; i++) {
      if (_shouldCreateWallet(ops[i])) {
        Create2.deploy(0, bytes32(ops[i].nonce), ops[i].initCode);
      }
    }

    // Execution loop
    // 1. Call the wallet with the UserOperation’s calldata
    // Refund unused gas fees
  }
}
