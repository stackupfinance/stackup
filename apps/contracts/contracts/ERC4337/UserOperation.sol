// Based on https://eips.ethereum.org/EIPS/eip-4337

// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "../ERC2470/SingletonFactory.sol";
import {IWallet} from "./interface/IWallet.sol";
import {Stake} from "./Stake.sol";

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

library UserOperationUtils {
  function messageHash(UserOperation calldata op)
    internal
    pure
    returns (bytes32)
  {
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

library EntryPointUserOperation {
  function totalGas(UserOperation calldata op) internal pure returns (uint256) {
    return op.callGas + op.verificationGas + op.preVerificationGas;
  }

  function gasPrice(UserOperation calldata op) internal view returns (uint256) {
    if (op.maxFeePerGas == op.maxPriorityFeePerGas) {
      // For blockchains that don't support EIP-1559 transactions.
      // Avoids calling the BASEFEE opcode.
      return op.maxFeePerGas;
    } else {
      return Math.min(op.maxFeePerGas, op.maxPriorityFeePerGas + block.basefee);
    }
  }

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
    require(
      stake.isLocked && stake.value >= totalGas(op) * gasPrice(op),
      "EntryPoint: Invalid stake"
    );
  }

  function deployWallet(UserOperation calldata op, address create2Factory)
    internal
  {
    SingletonFactory(create2Factory).deploy(op.initCode, bytes32(op.nonce));
  }

  function validateUserOp(UserOperation calldata op, uint256 requiredPrefund)
    internal
  {
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
    return op.messageHash().toEthSignedMessageHash().recover(op.signature);
  }
}
