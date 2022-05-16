// SPDX-License-Identifier: AGPL-3.0

pragma solidity 0.8.9;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "../UserOperation.sol";

error FailedOp(uint256 opIndex, string reason);

// solhint-disable-next-line func-visibility
function requireFailedOp(
  bool condition,
  uint256 opIndex,
  string memory reason
) pure {
  if (!condition) revert FailedOp(opIndex, reason);
}

/**
 * @dev Entry point helpers library
 */
library EntryPointHelpers {
  using Address for address;

  /**
   * @dev Tells whether the op has requested a paymaster or not
   */
  function hasPaymaster(UserOperation calldata op) internal pure returns (bool) {
    return op.paymaster != address(0);
  }

  /**
   * @dev Tells whether the op has an init code set or not
   */
  function hasInitCode(UserOperation calldata op) internal pure returns (bool) {
    return op.initCode.length != 0;
  }

  /**
   * @dev Tells whether the op wallet was already deployed or not
   */
  function isAlreadyDeployed(UserOperation calldata op) internal view returns (bool) {
    return op.sender.isContract();
  }

  /**
   * @dev Tells the entry point request ID: op + entry point + chain ID
   */
  function requestId(UserOperation calldata op) internal view returns (bytes32) {
    return keccak256(abi.encode(hash(op), address(this), block.chainid));
  }

  /**
   * @dev Tells the total amount in wei that must be refunded to the entry point for a given op
   */
  function requiredPrefund(UserOperation calldata op) internal view returns (uint256) {
    uint256 totalGas = op.callGas + op.verificationGas + op.preVerificationGas;
    return totalGas * gasPrice(op);
  }

  /**
   * @dev Tells the gas price to be used for an op. It uses GASPRICE for chains that don't support EIP1559 transactions.
   */
  function gasPrice(UserOperation calldata op) internal view returns (uint256) {
    return
      op.maxFeePerGas == op.maxPriorityFeePerGas
        ? op.maxFeePerGas
        : Math.min(op.maxFeePerGas, op.maxPriorityFeePerGas + block.basefee);
  }

  /**
   * @dev Hashes a user operation
   */
  function hash(UserOperation calldata op) internal pure returns (bytes32) {
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

  /**
   * @dev Custom SafeMath function used for the EntryPoint to raise FailedOp errors instead
   */
  function sub(
    uint256 a,
    uint256 b,
    uint256 opIndex,
    string memory reason
  ) internal pure returns (uint256) {
    (bool succeed, uint256 result) = SafeMath.trySub(a, b);
    requireFailedOp(succeed, opIndex, reason);
    return result;
  }
}
