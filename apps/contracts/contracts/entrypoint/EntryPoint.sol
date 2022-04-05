// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";

import "./Staking.sol";
import "./IEntryPoint.sol";
import "./EntryPointHelpers.sol";
import "../helpers/Calls.sol";
import "../UserOperation.sol";

contract EntryPoint is IEntryPoint, Staking {
  using Calls for address;
  using Calls for address payable;
  using Address for address;
  using EntryPointHelpers for UserOperation;

  struct UserOpVerification {
    bytes context;
    uint256 gas;
    UserOperation op;
  }

  ISingletonFactory public immutable create2Factory;

  constructor(ISingletonFactory _create2Factory) {
    create2Factory = _create2Factory;
  }

  function getGasPrice(UserOperation calldata op) external view returns (uint256) {
    return op.gasPrice();
  }

  function getRequiredPrefund(UserOperation calldata op) external view returns (uint256) {
    return op.requiredPrefund();
  }

  function getSenderAddress(bytes memory initCode, uint256 salt) external view returns (address) {
    bytes32 data = keccak256(abi.encodePacked(bytes1(0xff), address(create2Factory), salt, keccak256(initCode)));
    return address(uint160(uint256(data)));
  }

  function handleOps(UserOperation[] calldata ops, address payable redeemer) external {
    UserOpVerification[] memory verifications = _verifyOps(ops);
    uint256 totalGasCost = _executeOps(verifications);
    redeemer.sendValue(totalGasCost, "EntryPoint: Failed to redeem");
  }

  function _verifyOps(UserOperation[] calldata ops) internal returns (UserOpVerification[] memory verifications) {
    UserOpVerification memory verification;
    verifications = new UserOpVerification[](ops.length);

    for (uint256 i = 0; i < ops.length; i++) {
      uint256 preValidationGas = gasleft();
      verification = verifications[i];
      verification.op = ops[i];
      verification.op.deployWalletIfNecessary(create2Factory);
      verification.context = verification.op.validatePaymasterIfNecessary(_getStake(verification.op.paymaster));
      verification.op.validateUserOp();
      verification.gas = preValidationGas - gasleft();
    }
  }

  function _executeOps(UserOpVerification[] memory verifications) internal returns (uint256 totalGasCost) {
    UserOpVerification memory verification;
    for (uint256 i = 0; i < verifications.length; i++) {
      verification = verifications[i];
      uint256 gasCost = _executeOp(verification);
      uint256 refund = verification.op.requiredPrefund() - gasCost;
      totalGasCost += gasCost;

      if (verification.op.hasPaymaster()) {
        IPaymaster(verification.op.paymaster).postOp(PostOpMode.opSucceeded, verification.context, gasCost);
        Stake storage stake = _getStake(verification.op.paymaster);
        stake.value = stake.value + refund;
      } else {
        payable(verification.op.sender).sendValue(refund, "EntryPoint: Failed to refund");
      }
    }
  }

  function _executeOp(UserOpVerification memory verification) internal returns (uint256 gasCost) {
    uint256 preExecutionGas = gasleft();
    verification.op.sender.callWithGas(verification.op.callData, verification.op.callGas, "EntryPoint: Execute failed");
    uint256 gas = verification.gas + preExecutionGas - gasleft();
    return gas * verification.op.gasPrice();
  }
}
