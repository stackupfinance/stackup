// Based on https://eips.ethereum.org/EIPS/eip-4337

// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";
import "../ERC2470/SingletonFactory.sol";
import "./interface/IEntryPoint.sol";

import "hardhat/console.sol";

contract EntryPoint is IEntryPoint {
  address public immutable create2Factory;

  constructor(address _create2Factory) {
    create2Factory = _create2Factory;
  }

  function _shouldCreateWallet(address sender, bytes calldata initCode)
    internal
    view
    returns (bool)
  {
    if (!Address.isContract(sender) && initCode.length == 0) {
      revert("ERC4337: No wallet and initCode");
    }

    return !Address.isContract(sender) && initCode.length != 0;
  }

  function _deployWallet(bytes calldata initCode, uint256 nonce) internal {
    SingletonFactory(create2Factory).deploy(initCode, bytes32(nonce));
  }

  function handleOps(UserOperation[] calldata ops, address payable redeemer)
    external
  {
    // TODO: What is this used for?
    redeemer;

    uint256 opslen = ops.length;

    // Verification loop
    // 1. Create the wallet if it does not yet exist
    // 2. Call validateUserOp on the wallet
    for (uint256 i = 0; i < opslen; i++) {
      if (_shouldCreateWallet(ops[i].sender, ops[i].initCode)) {
        _deployWallet(ops[i].initCode, ops[i].nonce);
      }
    }

    // Execution loop
    // 1. Call the wallet with the UserOperation’s calldata
    // Refund unused gas fees
  }
}
