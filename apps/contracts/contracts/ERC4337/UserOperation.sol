// Based on https://eips.ethereum.org/EIPS/eip-4337

// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "solidity-bytes-utils/contracts/BytesLib.sol";
import "../ERC2470/ISingletonFactory.sol";
import {IWallet} from "./interface/IWallet.sol";
import {Stake} from "./Stake.sol";

import "hardhat/console.sol";

struct UserOperation {
  address sender;
  uint256 nonce;
  bytes initCode;
  bytes callData;
  uint256 callGas;
  uint256 verificationGas;
  uint256 preVerificationGas;
  uint256 maxFeePerGas;
  uint256 maxPriorityFeePerGas;
  address paymaster;
  bytes paymasterData;
  bytes signature;
}

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

library UserOperationUtils {
  function requiredPrefund(UserOperation calldata op)
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

  function decodeWalletCallData(UserOperation calldata op)
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

  function decodePaymasterData(UserOperation calldata op)
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

  function requiredTokenFee(UserOperation calldata op, uint256 maxcost)
    internal
    view
    returns (uint256)
  {
    PaymasterData memory pd = decodePaymasterData(op);
    (, int256 price, , , ) = AggregatorV3Interface(pd.dataFeed)
      .latestRoundData();

    return (uint256(price) * maxcost) + pd.fee;
  }

  function isCallingTokenApprove(UserOperation calldata op)
    internal
    pure
    returns (bool)
  {
    WalletCallData memory wcd = decodeWalletCallData(op);
    PaymasterData memory pd = decodePaymasterData(op);

    return
      wcd.to == pd.erc20Token &&
      bytes4(BytesLib.slice(wcd.data, 0, 4)) ==
      bytes4(keccak256(bytes("approve(address,uint256)")));
  }

  function hasOKTokenApproveValue(UserOperation calldata op, uint256 maxcost)
    internal
    view
    returns (bool)
  {
    WalletCallData memory wcd = decodeWalletCallData(op);
    (address spender, uint256 value) = abi.decode(
      BytesLib.slice(wcd.data, 4, wcd.data.length - 4),
      (address, uint256)
    );

    return spender == address(this) && value >= requiredTokenFee(op, maxcost);
  }
}

library EntryPointUserOperation {
  using UserOperationUtils for UserOperation;

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
  {
    require(stake.isLocked, "EntryPoint: Stake not locked");
    require(
      stake.value >= op.requiredPrefund(),
      "EntryPoint: Insufficient stake"
    );
  }

  function deployWallet(UserOperation calldata op, address create2Factory)
    internal
  {
    ISingletonFactory(create2Factory).deploy(op.initCode, bytes32(op.nonce));
  }

  function validateUserOp(UserOperation calldata op) internal {
    uint256 requiredPrefund = hasPaymaster(op) ? 0 : op.requiredPrefund();
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
}

library WalletUserOperation {
  using UserOperationUtils for UserOperation;
  using ECDSA for bytes32;

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
    PaymasterData memory pd = op.decodePaymasterData();
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
    PaymasterData memory pd = op.decodePaymasterData();

    return
      IERC20(pd.erc20Token).allowance(op.sender, address(this)) >=
      op.requiredTokenFee(maxcost);
  }

  function tokenAllowanceRemainsOK(UserOperation calldata op, uint256 maxcost)
    internal
    view
    returns (bool)
  {
    // Is not changing token allowance but if it is make sure value is OK.
    return !op.isCallingTokenApprove() || op.hasOKTokenApproveValue(maxcost);
  }

  function tokenAllowanceWillBeOK(UserOperation calldata op, uint256 maxcost)
    internal
    view
    returns (bool)
  {
    // Is changing token allowance with an OK value.
    return op.isCallingTokenApprove() && op.hasOKTokenApproveValue(maxcost);
  }
}
