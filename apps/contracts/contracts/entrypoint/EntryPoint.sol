// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./Staking.sol";
import "./IEntryPoint.sol";
import "./ISingletonFactory.sol";
import "./EntryPointHelpers.sol";
import "../UserOperation.sol";
import "../helpers/Calls.sol";
import "../helpers/GasUsed.sol";
import "../wallet/IWallet.sol";
import "../paymaster/IPaymaster.sol";

contract EntryPoint is IEntryPoint, Staking {
  using Calls for address;
  using Calls for address payable;
  using Address for address;
  using SafeMath for uint256;
  using EntryPointHelpers for UserOperation;

  struct UserOpVerification {
    bytes context;
    uint256 gasUsed;
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

  function simulateValidation(UserOperation calldata op) external returns (uint256 preOpGas, uint256 prefund) {
    require(msg.sender == address(0), "EntryPoint: Caller not zero");
    uint256 preGas = gasleft();
    _verifyOp(op);
    preOpGas = GasUsed.since(preGas) + op.preVerificationGas;
    prefund = op.requiredPrefund();
  }

  function handleOps(UserOperation[] calldata ops, address payable redeemer) external {
    UserOpVerification[] memory verifications = new UserOpVerification[](ops.length);
    for (uint256 i = 0; i < ops.length; i++) verifications[i] = _verifyOp(ops[i]);

    uint256 totalGasCost;
    for (uint256 i = 0; i < ops.length; i++) totalGasCost += _executeOp(ops[i], verifications[i]);
    redeemer.sendValue(totalGasCost, "EntryPoint: Failed to redeem");
  }

  function _verifyOp(UserOperation calldata op) internal returns (UserOpVerification memory verification) {
    uint256 preValidationGas = gasleft();
    _createWalletIfNecessary(op);
    bytes32 requestId = op.requestId();
    _validateWallet(op, requestId);

    // Marker used of-chain for opcodes validation
    block.number;

    uint256 walletValidationGas = GasUsed.since(preValidationGas);
    uint256 paymasterValidationGas = op.verificationGas.sub(walletValidationGas, "EntryPoint: Verif gas not enough");
    verification.context = _validatePaymaster(op, requestId, paymasterValidationGas);
    verification.gasUsed = GasUsed.since(preValidationGas);
    require(verification.gasUsed <= op.verificationGas, "EntryPoint: Verif gas not enough");
  }

  function _createWalletIfNecessary(UserOperation calldata op) internal {
    bool hasInitCode = op.hasInitCode();
    bool isAlreadyDeployed = op.isAlreadyDeployed();
    require((isAlreadyDeployed && !hasInitCode) || (!isAlreadyDeployed && hasInitCode), "EntryPoint: Wrong init code");

    if (!isAlreadyDeployed) {
      create2Factory.deploy(op.initCode, bytes32(op.nonce));
    }
  }

  function _validateWallet(UserOperation calldata op, bytes32 requestId) internal {
    uint256 requiredPrefund = op.hasPaymaster() ? 0 : op.requiredPrefund();
    uint256 initBalance = address(this).balance;
    IWallet(op.sender).validateUserOp{ gas: op.verificationGas }(op, requestId, requiredPrefund);

    uint256 actualPrefund = address(this).balance.sub(initBalance, "EntryPoint: Balance decreased");
    require(actualPrefund >= requiredPrefund, "EntryPoint: incorrect prefund");
  }

  function _validatePaymaster(
    UserOperation calldata op,
    bytes32 requestId,
    uint256 validationGas
  ) internal returns (bytes memory) {
    if (!op.hasPaymaster()) return new bytes(0);

    Stake storage stake = _getStake(op.paymaster);
    require(stake.isLocked, "EntryPoint: Stake not locked");
    uint256 requiredPrefund = op.requiredPrefund();
    stake.value = stake.value.sub(requiredPrefund, "EntryPoint: Insufficient stake");

    return IPaymaster(op.paymaster).validatePaymasterUserOp{ gas: validationGas }(op, requestId, requiredPrefund);
  }

  function _executeOp(UserOperation calldata op, UserOpVerification memory verification)
    internal
    returns (uint256 totalGasCost)
  {
    uint256 preExecutionGas = gasleft();
    // solhint-disable-next-line avoid-low-level-calls
    (bool success, ) = op.sender.call{ gas: op.callGas }(op.callData);
    uint256 totalGasUsed = verification.gasUsed + GasUsed.since(preExecutionGas);
    totalGasCost = totalGasUsed * op.gasPrice();
    uint256 refund = op.requiredPrefund().sub(totalGasCost, "EntryPoint: Insufficient refund");

    if (op.hasPaymaster()) {
      return _executePostOp(op, verification, preExecutionGas, totalGasCost, success);
    } else {
      payable(op.sender).sendValue(refund, "EntryPoint: Failed to refund");
    }
  }

  function _executePostOp(
    UserOperation calldata op,
    UserOpVerification memory verification,
    uint256 preExecutionGas,
    uint256 gasCost,
    bool success
  ) internal returns (uint256 actualGasCost) {
    uint256 gasPrice = op.gasPrice();
    uint256 requiredPrefund = op.requiredPrefund();
    PostOpMode mode = success ? PostOpMode.opSucceeded : PostOpMode.opReverted;

    try IPaymaster(op.paymaster).postOp(mode, verification.context, gasCost) {
      uint256 totalGasUsed = verification.gasUsed + GasUsed.since(preExecutionGas);
      actualGasCost = totalGasUsed * gasPrice;
    } catch {
      uint256 gasUsedIncludingPostOp = verification.gasUsed + GasUsed.since(preExecutionGas);
      uint256 gasCostIncludingPostOp = gasUsedIncludingPostOp * gasPrice;
      IPaymaster(op.paymaster).postOp(PostOpMode.postOpReverted, verification.context, gasCostIncludingPostOp);
      uint256 totalGasUsed = verification.gasUsed + GasUsed.since(preExecutionGas);
      actualGasCost = totalGasUsed * gasPrice;
    }

    uint256 refund = requiredPrefund.sub(actualGasCost, "EntryPoint: Insufficient refund");
    Stake storage stake = _getStake(op.paymaster);
    stake.value = stake.value + refund;
  }
}
