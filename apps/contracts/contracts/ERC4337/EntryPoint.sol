// Based on https://eips.ethereum.org/EIPS/eip-4337

// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import {IEntryPoint} from "./interface/IEntryPoint.sol";
import {UserOperation, EntryPointUserOperation} from "./UserOperation.sol";

import "hardhat/console.sol";

contract EntryPoint is IEntryPoint {
  using EntryPointUserOperation for UserOperation;

  address public immutable create2Factory;

  // solhint-disable-next-line no-empty-blocks
  receive() external payable {}

  constructor(address _create2Factory) {
    create2Factory = _create2Factory;
  }

  function handleOps(UserOperation[] calldata ops, address payable redeemer)
    external
  {
    // TODO: What is this used for?
    redeemer;

    uint256 opslen = ops.length;

    // Verification loop
    for (uint256 i = 0; i < opslen; i++) {
      if (ops[i].shouldCreateWallet()) {
        ops[i].deployWallet(create2Factory);
      }

      ops[i].validate();
    }

    // Execution loop
    // 1. Call the wallet with the UserOperation’s calldata
    // 2. Refund unused gas fees
    for (uint256 i = 0; i < opslen; i++) {
      ops[i].execute();
    }
  }
}
