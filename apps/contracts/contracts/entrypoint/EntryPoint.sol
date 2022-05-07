// SPDX-License-Identifier: AGPL-3.0

pragma solidity 0.8.9;

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
  using EntryPointHelpers for uint256;
  using EntryPointHelpers for address;
  using EntryPointHelpers for UserOperation;

  struct UserOpVerification {
    bytes context;
    uint256 prefund;
    uint256 gasUsed;
    bytes32 requestId;
  }

  event UserOperationExecuted(
    address indexed sender,
    address indexed paymaster,
    bytes32 requestId,
    bool success,
    bytes result
  );

  ISingletonFactory public immutable create2Factory;

  constructor(ISingletonFactory _create2Factory, uint32 _unstakeDelaySec) Staking(_unstakeDelaySec) {
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
    uint256 preGas = gasleft();
    UserOpVerification memory verification = _verifyOp(0, op);
    preOpGas = GasUsed.since(preGas) + op.preVerificationGas;
    prefund = verification.prefund;
    require(msg.sender == address(0), "EntryPoint: Caller not zero");
  }

  function handleOps(UserOperation[] calldata ops, address payable redeemer) external {
    UserOpVerification[] memory verifications = new UserOpVerification[](ops.length);
    for (uint256 i = 0; i < ops.length; i++) verifications[i] = _verifyOp(i, ops[i]);

    uint256 totalGasCost;
    for (uint256 i = 0; i < ops.length; i++) totalGasCost += _executeOp(i, ops[i], verifications[i]);
    redeemer.sendValue(totalGasCost, "EntryPoint: Failed to redeem");
  }

  function _verifyOp(uint256 opIndex, UserOperation calldata op)
    internal
    returns (UserOpVerification memory verification)
  {
    uint256 preValidationGas = gasleft();
    _createWalletIfNecessary(opIndex, op);
    bytes32 requestId = op.requestId();
    uint256 prefund = op.requiredPrefund();
    _validateWallet(opIndex, op, requestId, prefund);

    // Marker used of-chain for opcodes validation
    uint256 marker = block.number;
    (marker);

    uint256 walletGas = GasUsed.since(preValidationGas);
    uint256 paymasterValidationGas = op.verificationGas.sub(walletGas, opIndex, "EntryPoint: Verif gas not enough");
    verification.prefund = prefund;
    verification.requestId = requestId;
    verification.context = _validatePaymaster(opIndex, op, requestId, prefund, paymasterValidationGas);
    verification.gasUsed = GasUsed.since(preValidationGas);
    requireFailedOp(verification.gasUsed <= op.verificationGas, opIndex, "EntryPoint: Verif gas not enough");
  }

  function _createWalletIfNecessary(uint256 opIndex, UserOperation calldata op) internal {
    bool hasInitCode = op.hasInitCode();
    bool isAlreadyDeployed = op.isAlreadyDeployed();
    bool isProperlyFormed = (isAlreadyDeployed && !hasInitCode) || (!isAlreadyDeployed && hasInitCode);
    requireFailedOp(isProperlyFormed, opIndex, "EntryPoint: Wrong init code");

    if (!isAlreadyDeployed) {
      create2Factory.deploy(op.initCode, bytes32(op.nonce));
    }
  }

  function _validateWallet(
    uint256 opIndex,
    UserOperation calldata op,
    bytes32 requestId,
    uint256 prefund
  ) internal {
    uint256 requiredPrefund = op.hasPaymaster() ? 0 : prefund;
    uint256 initBalance = address(this).balance;

    try IWallet(op.sender).validateUserOp{ gas: op.verificationGas }(op, requestId, requiredPrefund) {
      // solhint-disable-previous-line no-empty-blocks
    } catch Error(string memory reason) {
      revert FailedOp(opIndex, reason);
    } catch (bytes memory error) {
      revert FailedOp(opIndex, string(error));
    }

    uint256 actualPrefund = address(this).balance.sub(initBalance, opIndex, "EntryPoint: Balance decreased");
    requireFailedOp(actualPrefund >= requiredPrefund, opIndex, "EntryPoint: Incorrect prefund");
  }

  function _validatePaymaster(
    uint256 opIndex,
    UserOperation calldata op,
    bytes32 requestId,
    uint256 prefund,
    uint256 validationGas
  ) internal returns (bytes memory) {
    if (!op.hasPaymaster()) return new bytes(0);

    requireFailedOp(isStaked(op.paymaster), opIndex, "EntryPoint: Deposit not staked");
    _decreaseStake(op.paymaster, prefund);

    try IPaymaster(op.paymaster).validatePaymasterUserOp{ gas: validationGas }(op, requestId, prefund) returns (
      bytes memory result
    ) {
      return result;
    } catch Error(string memory reason) {
      revert FailedOp(opIndex, reason);
    } catch (bytes memory error) {
      revert FailedOp(opIndex, string(error));
    }
  }

  function _executeOp(
    uint256 opIndex,
    UserOperation calldata op,
    UserOpVerification memory verification
  ) internal returns (uint256 totalGasCost) {
    uint256 preExecutionGas = gasleft();
    // solhint-disable-next-line avoid-low-level-calls
    (bool success, bytes memory result) = op.sender.call{ gas: op.callGas }(op.callData);
    emit UserOperationExecuted(op.sender, op.paymaster, verification.requestId, success, result);

    uint256 totalGasUsed = verification.gasUsed + GasUsed.since(preExecutionGas);
    totalGasCost = totalGasUsed * op.gasPrice();

    if (op.hasPaymaster()) {
      return _executePostOp(opIndex, op, verification, preExecutionGas, totalGasCost, success);
    } else {
      uint256 refund = verification.prefund.sub(totalGasCost, opIndex, "EntryPoint: Insufficient refund");
      payable(op.sender).sendValue(refund, "EntryPoint: Failed to refund");
    }
  }

  function _executePostOp(
    uint256 opIndex,
    UserOperation calldata op,
    UserOpVerification memory verification,
    uint256 preExecutionGas,
    uint256 gasCost,
    bool success
  ) internal returns (uint256 actualGasCost) {
    uint256 gasPrice = op.gasPrice();
    PostOpMode mode = success ? PostOpMode.opSucceeded : PostOpMode.opReverted;

    try IPaymaster(op.paymaster).postOp(mode, verification.context, gasCost) {
      uint256 totalGasUsed = verification.gasUsed + GasUsed.since(preExecutionGas);
      actualGasCost = totalGasUsed * gasPrice;
    } catch {
      uint256 gasUsedIncludingPostOp = verification.gasUsed + GasUsed.since(preExecutionGas);
      uint256 gasCostIncludingPostOp = gasUsedIncludingPostOp * gasPrice;

      try IPaymaster(op.paymaster).postOp(PostOpMode.postOpReverted, verification.context, gasCostIncludingPostOp) {
        // solhint-disable-previous-line no-empty-blocks
      } catch Error(string memory reason) {
        revert FailedOp(opIndex, reason);
      } catch (bytes memory error) {
        revert FailedOp(opIndex, string(error));
      }

      uint256 totalGasUsed = verification.gasUsed + GasUsed.since(preExecutionGas);
      actualGasCost = totalGasUsed * gasPrice;
    }

    uint256 refund = verification.prefund.sub(actualGasCost, opIndex, "EntryPoint: Insufficient refund");
    _increaseStake(op.paymaster, refund);
  }
}
