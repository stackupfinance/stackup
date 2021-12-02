// Based on https://eips.ethereum.org/EIPS/eip-4337

// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "solidity-bytes-utils/contracts/BytesLib.sol";
import {UserOperation} from "./UserOperation.sol";

import "hardhat/console.sol";

struct WalletCallData {
  address to;
  uint256 value;
  bytes data;
}

struct PaymasterData {
  uint256 fee;
  address erc20Token;
  address dataFeed;
  bytes signature;
}

library WalletUserOperation {
  using ECDSA for bytes32;

  function _decodeWalletCallData(UserOperation calldata op)
    internal
    pure
    returns (WalletCallData memory)
  {
    (address to, uint256 value, bytes memory data) = abi.decode(
      op.callData[4:],
      (address, uint256, bytes)
    );

    WalletCallData memory _data;
    _data.to = to;
    _data.value = value;
    _data.data = data;
    return _data;
  }

  function _decodePaymasterData(UserOperation calldata op)
    internal
    pure
    returns (PaymasterData memory)
  {
    (
      uint256 fee,
      address erc20Token,
      address dataFeed,
      bytes memory signature
    ) = abi.decode(op.paymasterData, (uint256, address, address, bytes));

    PaymasterData memory data;
    data.fee = fee;
    data.erc20Token = erc20Token;
    data.dataFeed = dataFeed;
    data.signature = signature;
    return data;
  }

  function _requiredTokenExchangeRate(UserOperation calldata op)
    internal
    view
    returns (uint256)
  {
    PaymasterData memory pd = _decodePaymasterData(op);
    (, int256 price, , , ) = AggregatorV3Interface(pd.dataFeed)
      .latestRoundData();

    // Chainlink datafeeds return either 8 or 18 decimals
    // However tokens like USDC only have 6 decimals
    // We need to return a rate that matches the decimals of the ERC20 token
    return
      uint256(price) /
      10 **
        (AggregatorV3Interface(pd.dataFeed).decimals() -
          IERC20Metadata(pd.erc20Token).decimals());
  }

  function _requiredTokenFee(UserOperation calldata op, uint256 maxcost)
    internal
    view
    returns (uint256)
  {
    PaymasterData memory pd = _decodePaymasterData(op);
    uint256 scaleFactor = 10**IERC20Metadata(pd.erc20Token).decimals();
    uint256 tokenFee = (maxcost *
      _requiredTokenExchangeRate(op) *
      scaleFactor) / (10**18 * scaleFactor);

    return tokenFee + pd.fee;
  }

  function _isCallingTokenApprove(UserOperation calldata op)
    internal
    pure
    returns (bool)
  {
    WalletCallData memory wcd = _decodeWalletCallData(op);
    PaymasterData memory pd = _decodePaymasterData(op);

    return
      wcd.to == pd.erc20Token &&
      bytes4(BytesLib.slice(wcd.data, 0, 4)) ==
      bytes4(keccak256(bytes("approve(address,uint256)")));
  }

  function _hasOKTokenApproveValue(UserOperation calldata op, uint256 maxcost)
    internal
    view
    returns (bool)
  {
    WalletCallData memory wcd = _decodeWalletCallData(op);
    (address spender, uint256 value) = abi.decode(
      BytesLib.slice(wcd.data, 4, wcd.data.length - 4),
      (address, uint256)
    );

    return spender == address(this) && value >= _requiredTokenFee(op, maxcost);
  }

  function signer(UserOperation calldata op) internal pure returns (address) {
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
      ).toEthSignedMessageHash().recover(op.signature);
  }

  function paymasterSigner(UserOperation calldata op)
    internal
    pure
    returns (address)
  {
    PaymasterData memory pd = _decodePaymasterData(op);
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
          keccak256(abi.encodePacked(pd.fee, pd.erc20Token, pd.dataFeed))
        )
      ).toEthSignedMessageHash().recover(pd.signature);
  }

  function requiredTokenIsApproved(UserOperation calldata op, uint256 maxcost)
    internal
    view
    returns (bool)
  {
    PaymasterData memory pd = _decodePaymasterData(op);

    return
      IERC20(pd.erc20Token).allowance(op.sender, address(this)) >=
      _requiredTokenFee(op, maxcost);
  }

  function tokenAllowanceRemainsOK(UserOperation calldata op, uint256 maxcost)
    internal
    view
    returns (bool)
  {
    // Is not changing token allowance but if it is make sure value is OK.
    return !_isCallingTokenApprove(op) || _hasOKTokenApproveValue(op, maxcost);
  }

  function tokenAllowanceWillBeOK(UserOperation calldata op, uint256 maxcost)
    internal
    view
    returns (bool)
  {
    // Is changing token allowance with an OK value.
    return _isCallingTokenApprove(op) && _hasOKTokenApproveValue(op, maxcost);
  }

  function requiredTokenIsApprovedInPrevOps(UserOperation calldata op)
    internal
    pure
    returns (bool)
  {
    // A paymaster fee of 0 means approval and fee collection has
    // already occured within a previous op in the batch.
    PaymasterData memory pd = _decodePaymasterData(op);

    return pd.fee == 0;
  }

  function paymasterContext(UserOperation calldata op)
    internal
    view
    returns (bytes memory context)
  {
    PaymasterData memory pd = _decodePaymasterData(op);

    return
      abi.encode(
        op.sender,
        pd.erc20Token,
        _requiredTokenExchangeRate(op),
        pd.fee
      );
  }
}
