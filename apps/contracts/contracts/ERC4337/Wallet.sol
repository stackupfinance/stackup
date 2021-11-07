// Stackup implementation of an ERC-4337 Wallet with Paymaster
// Based on https://eips.ethereum.org/EIPS/eip-4337

// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IWallet} from "./interface/IWallet.sol";
import {PostOpMode, IPaymaster} from "./interface/IPaymaster.sol";
import {UserOperation, WalletUserOperation} from "./UserOperation.sol";

import "hardhat/console.sol";

contract Wallet is IWallet, IPaymaster {
  using WalletUserOperation for UserOperation;

  address public entryPoint;
  address public owner;
  uint256 public nonce;

  // solhint-disable-next-line no-empty-blocks
  receive() external payable {}

  constructor(address _entryPoint, address _owner) {
    entryPoint = _entryPoint;
    owner = _owner;
  }

  modifier onlyEntryPoint() {
    require(msg.sender == entryPoint, "Wallet: Not from EntryPoint");
    _;
  }

  function validateUserOp(
    UserOperation calldata userOp,
    uint256 requiredPrefund
  ) external onlyEntryPoint {
    require(userOp.signer() == owner, "Wallet: Invalid signature");

    if (userOp.initCode.length == 0) {
      require(nonce == userOp.nonce, "Wallet: Invalid nonce");
      nonce++;
    }

    if (requiredPrefund != 0) {
      // solhint-disable-next-line avoid-low-level-calls
      (bool success, ) = entryPoint.call{value: requiredPrefund}("");
      success;
    }
  }

  function executeUserOp(
    address to,
    uint256 value,
    bytes calldata data
  ) external onlyEntryPoint {
    // solhint-disable-next-line avoid-low-level-calls
    (bool success, bytes memory result) = to.call{value: value}(data);

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

  function validatePaymasterUserOp(
    UserOperation calldata userOp,
    uint256 maxcost
  ) external view returns (bytes memory context) {
    require(userOp.paymasterSigner() == owner, "Paymaster: Invalid signature");
    require(
      (userOp.requiredTokenIsApproved(maxcost) &&
        userOp.tokenAllowanceRemainsOK(maxcost)) ||
        userOp.tokenAllowanceWillBeOK(maxcost),
      "Paymaster: Not approved"
    );

    return userOp.paymasterContext();
  }

  function postOp(
    PostOpMode mode,
    bytes calldata context,
    uint256 actualGasCost
  ) external onlyEntryPoint {
    // Mode not used for this implementation.
    (mode);

    (
      address sender,
      address erc20Token,
      uint256 exchangeRate,
      uint256 fee
    ) = abi.decode(context, (address, address, uint256, uint256));

    IERC20(erc20Token).transferFrom(
      sender,
      address(this),
      ((actualGasCost * exchangeRate) / 10**18) + fee
    );
  }
}
