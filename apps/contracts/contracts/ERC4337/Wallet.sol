// Stackup implementation of an ERC-4337 Wallet with Paymaster
// Based on https://eips.ethereum.org/EIPS/eip-4337

// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {IWallet} from "./interface/IWallet.sol";
import {PostOpMode, IPaymaster} from "./interface/IPaymaster.sol";
import {UserOperation} from "./library/UserOperation.sol";
import {WalletUserOperation} from "./library/WalletUserOperation.sol";

import "hardhat/console.sol";

struct WalletSeed {
  address entryPoint;
  address owner;
  address[] guardians;
}

contract Wallet is IWallet, IPaymaster {
  using WalletUserOperation for UserOperation;
  using EnumerableSet for EnumerableSet.AddressSet;

  address public entryPoint;
  address public owner;
  EnumerableSet.AddressSet private guardians;
  uint256 public nonce;

  // solhint-disable-next-line no-empty-blocks
  receive() external payable {}

  constructor(WalletSeed memory seed) {
    entryPoint = seed.entryPoint;
    owner = seed.owner;

    for (uint256 i = 0; i < seed.guardians.length; i++) {
      guardians.add(seed.guardians[i]);
    }
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
    require(nonce == userOp.nonce, "Wallet: Invalid nonce");
    if (requiredPrefund != 0) {
      // solhint-disable-next-line avoid-low-level-calls
      (bool success, ) = entryPoint.call{value: requiredPrefund}("");
      success;
    }

    nonce++;
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
        userOp.tokenAllowanceWillBeOK(maxcost) ||
        userOp.requiredTokenIsApprovedInPrevOps(),
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
    uint256 scaleFactor = 10**IERC20Metadata(erc20Token).decimals();

    IERC20(erc20Token).transferFrom(
      sender,
      address(this),
      ((actualGasCost * exchangeRate * scaleFactor) / (10**18 * scaleFactor)) +
        fee
    );
  }

  function getGuardians() external view returns (address[] memory) {
    return guardians.values();
  }

  function addGuardian(address guardian) external onlyEntryPoint {
    require(guardian != owner, "Wallet: Owner cannot be guardian");
    guardians.add(guardian);
  }

  function removeGuardian(address guardian) external onlyEntryPoint {
    guardians.remove(guardian);
  }

  function recoverOwner(address newOnwer, bytes32[] calldata guardianSignatures)
    external
    onlyEntryPoint
  {}
}
