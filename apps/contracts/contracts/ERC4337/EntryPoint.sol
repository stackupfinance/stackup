// Based on https://eips.ethereum.org/EIPS/eip-4337

// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import {IEntryPoint, IEntryPointStakeController} from "./interface/IEntryPoint.sol";
import {UserOperation, EntryPointUserOperation} from "./UserOperation.sol";
import {Stake} from "./Stake.sol";

import "hardhat/console.sol";

contract EntryPoint is IEntryPoint, IEntryPointStakeController {
  using EntryPointUserOperation for UserOperation;

  address public immutable create2Factory;
  mapping(address => Stake) internal _paymasterStakes;

  // solhint-disable-next-line no-empty-blocks
  receive() external payable {}

  constructor(address _create2Factory) {
    create2Factory = _create2Factory;
  }

  function handleOps(UserOperation[] calldata ops, address payable redeemer)
    external
  {
    uint256 gasUsed;
    uint256[] memory verificationGas = new uint256[](ops.length);
    bytes[] memory contexts = new bytes[](ops.length);

    // Verification loop
    for (uint256 i = 0; i < ops.length; i++) {
      verificationGas[i] = gasleft();

      if (ops[i].shouldCreateWallet()) {
        ops[i].deployWallet(create2Factory);
      }

      if (ops[i].hasPaymaster()) {
        ops[i].verifyPaymasterStake(_paymasterStakes[ops[i].paymaster]);
        contexts[i] = ops[i].validatePaymasterUserOp();
      }

      ops[i].validateUserOp();

      verificationGas[i] = verificationGas[i] - gasleft();
    }

    // Execution loop
    // 1. Call the wallet with the UserOperation’s calldata
    // 2. Refund unused gas fees
    for (uint256 i = 0; i < ops.length; i++) {
      uint256 preExecutionGas = gasleft();

      ops[i].execute();

      uint256 actualGasCost = verificationGas[i] +
        (preExecutionGas - gasleft());
      gasUsed += actualGasCost;

      if (ops[i].hasPaymaster()) {
        ops[i].paymasterPostOp(contexts[i], actualGasCost);
      } else {
        // TODO: refund unused gas to wallet
        (ops[i].sender);
      }
    }

    // TODO: Transfer collected gas to redeemer
    (redeemer);
  }

  function addStake() external payable {
    _paymasterStakes[msg.sender].value = msg.value;
  }

  function lockStake() external {
    // solhint-disable-next-line not-rely-on-time
    _paymasterStakes[msg.sender].lockExpiryTime = block.timestamp + 2 days;
    _paymasterStakes[msg.sender].isLocked = true;
  }

  function unlockStake() external {
    require(
      // solhint-disable-next-line not-rely-on-time
      _paymasterStakes[msg.sender].lockExpiryTime <= block.timestamp,
      "EntryPoint: Lock not expired"
    );

    _paymasterStakes[msg.sender].lockExpiryTime = 0;
    _paymasterStakes[msg.sender].isLocked = false;
  }

  function withdrawStake(address payable withdrawAddress) external {
    require(
      !_paymasterStakes[msg.sender].isLocked,
      "EntryPoint: Stake is locked"
    );

    // solhint-disable-next-line avoid-low-level-calls
    (bool success, ) = withdrawAddress.call{
      value: _paymasterStakes[msg.sender].value
    }("");

    if (success) {
      _paymasterStakes[msg.sender].value = 0;
    }
  }

  function getStake(address paymaster)
    external
    view
    returns (
      uint256 value,
      uint256 lockExpiryTime,
      bool isLocked
    )
  {
    return (
      _paymasterStakes[paymaster].value,
      _paymasterStakes[paymaster].lockExpiryTime,
      _paymasterStakes[paymaster].isLocked
    );
  }
}
