// Based on https://eips.ethereum.org/EIPS/eip-4337

// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "../../ERC2470/ISingletonFactory.sol";
import {IWallet} from "../interface/IWallet.sol";
import {IPaymaster, PostOpMode} from "../interface/IPaymaster.sol";
import {UserOperation} from "./UserOperation.sol";
import {Stake} from "./Stake.sol";

import "hardhat/console.sol";

library EntryPointUserOperation {
  function _requiredPrefund(UserOperation calldata op)
    internal
    view
    returns (uint256)
  {
    uint256 totalGas = op.callGas + op.verificationGas + op.preVerificationGas;
    // For blockchains that don't support EIP-1559 transactions.
    // Avoids calling the BASEFEE opcode.
    uint256 gasPrice = op.maxFeePerGas == op.maxPriorityFeePerGas
      ? op.maxFeePerGas
      : Math.min(op.maxFeePerGas, op.maxPriorityFeePerGas + block.basefee);

    return totalGas * gasPrice;
  }

  function shouldCreateWallet(UserOperation calldata op)
    internal
    view
    returns (bool)
  {
    if (!Address.isContract(op.sender) && op.initCode.length == 0) {
      revert("EntryPoint: No wallet & initCode");
    }

    return !Address.isContract(op.sender) && op.initCode.length != 0;
  }

  function hasPaymaster(UserOperation calldata op)
    internal
    pure
    returns (bool)
  {
    return op.paymaster != address(0);
  }

  function verifyPaymasterStake(UserOperation calldata op, Stake memory stake)
    internal
    view
    returns (uint256)
  {
    require(stake.isLocked, "EntryPoint: Stake not locked");
    require(
      stake.value >= _requiredPrefund(op),
      "EntryPoint: Insufficient stake"
    );

    return stake.value - _requiredPrefund(op);
  }

  function finalizePaymasterStake(
    UserOperation calldata op,
    Stake memory stake,
    uint256 actualGasCost
  ) internal view returns (uint256) {
    return stake.value + _requiredPrefund(op) - actualGasCost;
  }

  function validatePaymasterUserOp(UserOperation calldata op)
    internal
    view
    returns (bytes memory)
  {
    return
      IPaymaster(op.paymaster).validatePaymasterUserOp(
        op,
        _requiredPrefund(op)
      );
  }

  function paymasterPostOp(
    UserOperation calldata op,
    bytes memory context,
    uint256 actualGasCost
  ) internal {
    IPaymaster(op.paymaster).postOp(
      PostOpMode.opSucceeded,
      context,
      actualGasCost
    );
  }

  function deployWallet(UserOperation calldata op, address create2Factory)
    internal
  {
    ISingletonFactory(create2Factory).deploy(op.initCode, bytes32(op.nonce));
  }

  function validateUserOp(UserOperation calldata op) internal {
    uint256 requiredPrefund = hasPaymaster(op) ? 0 : _requiredPrefund(op);
    uint256 initBalance = address(this).balance;

    IWallet(op.sender).validateUserOp{gas: op.verificationGas}(
      op,
      requiredPrefund
    );

    uint256 actualPrefund = address(this).balance - initBalance;
    if (actualPrefund < requiredPrefund) {
      revert("EntryPoint: incorrect prefund");
    }
  }

  function execute(UserOperation calldata op) internal {
    // solhint-disable-next-line avoid-low-level-calls
    (bool success, bytes memory result) = op.sender.call{gas: op.callGas}(
      op.callData
    );

    if (!success) {
      // solhint-disable-next-line reason-string
      if (result.length < 68) revert();
      // solhint-disable-next-line no-inline-assembly
      assembly {
        result := add(result, 0x04)
      }
      revert(abi.decode(result, (string)));
    }
  }

  function refundUnusedGas(UserOperation calldata op, uint256 actualGasCost)
    internal
  {
    // solhint-disable-next-line avoid-low-level-calls
    (bool success, ) = op.sender.call{
      value: _requiredPrefund(op) - actualGasCost
    }("");
    require(success, "EntryPoint: Failed to refund");
  }
}
