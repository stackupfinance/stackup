// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

import "./Staking.sol";
import "./EntryPoint.sol";
import "./ISingletonFactory.sol";
import "../UserOperation.sol";
import "../helpers/Calls.sol";
import "../wallet/IWallet.sol";
import "../paymaster/IPaymaster.sol";

library EntryPointHelpers {
  using Address for address;

  /**
   * @dev Tells whether the op has requested a paymaster or not
   */
  function hasPaymaster(UserOperation memory op) internal pure returns (bool) {
    return op.paymaster != address(0);
  }

  /**
   * @dev Tells the entry point request ID: op + entry point + chain ID
   */
  function requestId(UserOperation memory op) internal view returns (bytes32) {
    return keccak256(abi.encode(hash(op), address(this), block.chainid));
  }

  /**
   * @dev Tells the total amount in wei that must be refunded to the entry point for a given op
   */
  function requiredPrefund(UserOperation memory op) internal view returns (uint256) {
    uint256 totalGas = op.callGas + op.verificationGas + op.preVerificationGas;
    return totalGas * gasPrice(op);
  }

  /**
   * @dev Tells the gas price to be used for an op. It uses GASPRICE for chains that don't support EIP1559 transactions.
   */
  function gasPrice(UserOperation memory op) internal view returns (uint256) {
    return
      op.maxFeePerGas == op.maxPriorityFeePerGas
        ? op.maxFeePerGas
        : Math.min(op.maxFeePerGas, op.maxPriorityFeePerGas + block.basefee);
  }

  /**
   * @dev It deploys the wallet contract if necessary
   */
  function deployWalletIfNecessary(UserOperation memory op, ISingletonFactory create2Factory) internal {
    bool hasInitCode = op.initCode.length != 0;
    bool isAlreadyDeployed = op.sender.isContract();
    require((isAlreadyDeployed && !hasInitCode) || (!isAlreadyDeployed && hasInitCode), "EntryPoint: Wrong init code");
    if (!isAlreadyDeployed) create2Factory.deploy(op.initCode, bytes32(op.nonce));
  }

  /**
   * @dev It validates the paymaster stake and calls `IPaymaster#validatePaymasterUserOp` if necessary
   */
  function validatePaymasterIfNecessary(UserOperation memory op, Staking.Stake storage stake)
    internal
    returns (bytes memory)
  {
    if (!hasPaymaster(op)) return new bytes(0);
    require(stake.isLocked, "EntryPoint: Stake not locked");
    require(stake.value >= requiredPrefund(op), "EntryPoint: Insufficient stake");
    stake.value = stake.value - requiredPrefund(op);
    return IPaymaster(op.paymaster).validatePaymasterUserOp(op, requiredPrefund(op));
  }

  /**
   * @dev It validates a user operation calling `IWallet#validateUserOp`
   */
  function validateUserOp(UserOperation memory op) internal {
    uint256 prefundRequired = hasPaymaster(op) ? 0 : requiredPrefund(op);
    uint256 initBalance = address(this).balance;
    IWallet(op.sender).validateUserOp{ gas: op.verificationGas }(op, requestId(op), prefundRequired);
    uint256 actualPrefund = address(this).balance - initBalance;
    require(actualPrefund >= prefundRequired, "EntryPoint: incorrect prefund");
  }

  /**
   * @dev Hashes a user operation
   */
  function hash(UserOperation memory op) internal pure returns (bytes32) {
    return
      keccak256(
        abi.encodePacked(
          op.sender,
          op.nonce,
          keccak256(op.initCode),
          keccak256(op.callData),
          op.callGas,
          op.verificationGas,
          op.preVerificationGas,
          op.maxFeePerGas,
          op.maxPriorityFeePerGas,
          op.paymaster,
          keccak256(op.paymasterData)
        )
      );
  }
}
