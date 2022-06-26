// SPDX-License-Identifier: AGPL-3.0

pragma solidity 0.8.9;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "../UserOperation.sol";

enum PaymasterMode {
  FULL,
  FEE_ONLY,
  GAS_ONLY,
  FREE
}

struct PaymasterData {
  uint256 fee;
  PaymasterMode mode;
  IERC20Metadata token;
  AggregatorV3Interface feed;
  bytes signature;
}

struct PaymasterContext {
  address sender;
  PaymasterMode mode;
  IERC20Metadata token;
  uint256 rate;
  uint256 fee;
}

library PaymasterHelpers {
  using ECDSA for bytes32;

  /**
   * @dev Encodes the paymaster context: sender, token, rate, and fee
   */
  function paymasterContext(
    UserOperation calldata op,
    PaymasterData memory data,
    uint256 rate
  ) internal pure returns (bytes memory context) {
    return abi.encode(op.sender, data.mode, data.token, rate, data.fee);
  }

  /**
   * @dev Decodes paymaster data assuming it follows PaymasterData
   */
  function decodePaymasterData(UserOperation calldata op) internal pure returns (PaymasterData memory) {
    (uint256 fee, PaymasterMode mode, IERC20Metadata token, AggregatorV3Interface feed, bytes memory signature) = abi
      .decode(op.paymasterData, (uint256, PaymasterMode, IERC20Metadata, AggregatorV3Interface, bytes));
    return PaymasterData(fee, mode, token, feed, signature);
  }

  /**
   * @dev Decodes paymaster context assuming it follows PaymasterContext
   */
  function decodePaymasterContext(bytes memory context) internal pure returns (PaymasterContext memory) {
    (address sender, PaymasterMode mode, IERC20Metadata token, uint256 rate, uint256 fee) = abi.decode(
      context,
      (address, PaymasterMode, IERC20Metadata, uint256, uint256)
    );
    return PaymasterContext(sender, mode, token, rate, fee);
  }

  /**
   * @dev Encodes the request the paymaster should have signed for
   */
  function encodePaymasterRequest(UserOperation calldata op) internal pure returns (bytes32) {
    PaymasterData memory pd = decodePaymasterData(op);
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
          keccak256(abi.encodePacked(pd.fee, pd.mode, pd.token, pd.feed))
        )
      ).toEthSignedMessageHash();
  }
}
