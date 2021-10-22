// Stackup implementation of an ERC-4337 Wallet
// Based on https://eips.ethereum.org/EIPS/eip-4337

// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {IWallet} from "./interface/IWallet.sol";
import {UserOperation} from "./UserOperation.sol";

import "hardhat/console.sol";

contract Wallet is IWallet {
  using ECDSA for bytes32;

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
    require(
      keccak256(abi.encodePacked(userOp.nonce))
        .toEthSignedMessageHash()
        .recover(userOp.signature) == owner,
      "Wallet: Invalid signature"
    );

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
}
