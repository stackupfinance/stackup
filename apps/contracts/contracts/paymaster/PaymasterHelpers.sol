// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "../UserOperation.sol";
import "../helpers/Calldata.sol";
import "../wallet/WalletHelpers.sol";

struct PaymasterData {
  uint256 fee;
  IERC20Metadata token;
  AggregatorV3Interface feed;
  bytes signature;
}

struct PaymasterContext {
  address sender;
  IERC20Metadata token;
  uint256 rate;
  uint256 fee;
}

library PaymasterHelpers {
  using ECDSA for bytes32;
  using Calldata for bytes;
  using WalletHelpers for UserOperation;

  /**
   * @dev Tells if the op sender allowance for the paymaster is enough
   */
  function isTokenAllowanceEnough(
    UserOperation calldata op,
    PaymasterData memory data,
    uint256 tokenFee
  ) internal view returns (bool) {
    return data.token.allowance(op.sender, address(this)) >= tokenFee;
  }

  /**
   * @dev Tells if the op sender is not changing the paymaster allowance or if its changing it but still enough for fees
   */
  function tokenAllowanceRemainsOK(
    UserOperation calldata op,
    PaymasterData memory data,
    uint256 tokenFee
  ) internal pure returns (bool) {
    return !isCallingTokenApprove(op, data) || hasOKTokenApproveValue(op, tokenFee);
  }

  /**
   * @dev Tells if the op sender is changing the paymaster allowance and is still enough for fees
   */
  function tokenAllowanceWillBeOK(
    UserOperation calldata op,
    PaymasterData memory data,
    uint256 tokenFee
  ) internal pure returns (bool) {
    return isCallingTokenApprove(op, data) && hasOKTokenApproveValue(op, tokenFee);
  }

  /**
   * @dev Tells whether a paymaster fee was already paid or not
   * A paymaster fee of 0 means approval and fee collection has already occurred within a previous op in the batch.
   */
  function isRequiredTokenApprovedInPrevOps(PaymasterData memory data) internal pure returns (bool) {
    return data.fee == 0;
  }

  /**
   * @dev Tells whether the op sender is calling IERC20#approve through IWallet#executeUserOp
   */
  function isCallingTokenApprove(UserOperation calldata op, PaymasterData memory data) internal pure returns (bool) {
    if (!op.callData.isExecuteUserOp()) return false;

    WalletCallData memory walletCallData = op.decodeWalletCallData();
    return walletCallData.to == address(data.token) && walletCallData.data.isERC20Approve();
  }

  /**
   * @dev Tells whether the op sender is calling IERC20#approve through IWallet#executeUserOp with `tokenFee` or more
   */
  function hasOKTokenApproveValue(UserOperation calldata op, uint256 tokenFee) internal pure returns (bool) {
    if (!op.callData.isExecuteUserOp()) return false;

    // TODO: AUDIT! review spender
    WalletCallData memory walletCallData = op.decodeWalletCallData();
    (address spender, uint256 value) = abi.decode(walletCallData.data.params(), (address, uint256));
    return spender == op.paymaster && value >= tokenFee;
  }

  /**
   * @dev Decodes paymaster data assuming it follows PaymasterData
   */
  function decodePaymasterData(UserOperation calldata op) internal pure returns (PaymasterData memory) {
    (uint256 fee, IERC20Metadata token, AggregatorV3Interface feed, bytes memory signature) = abi.decode(
      op.paymasterData,
      (uint256, IERC20Metadata, AggregatorV3Interface, bytes)
    );
    return PaymasterData(fee, token, feed, signature);
  }

  /**
   * @dev Decodes paymaster context assuming it follows PaymasterContext
   */
  function decodePaymasterContext(bytes memory context) internal pure returns (PaymasterContext memory) {
    (address sender, IERC20Metadata token, uint256 rate, uint256 fee) = abi.decode(
      context,
      (address, IERC20Metadata, uint256, uint256)
    );
    return PaymasterContext(sender, token, rate, fee);
  }

  /**
   * @dev Encodes the paymaster context: sender, token, rate, and fee
   */
  function paymasterContext(
    UserOperation calldata op,
    PaymasterData memory data,
    uint256 rate
  ) internal pure returns (bytes memory context) {
    return abi.encode(op.sender, data.token, rate, data.fee);
  }

  /**
   * @dev Recover the paymaster signer
   */
  function paymasterSigner(UserOperation calldata op) internal pure returns (address) {
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
          keccak256(abi.encodePacked(pd.fee, pd.token, pd.feed))
        )
      ).toEthSignedMessageHash().recover(pd.signature);
  }
}
