// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

import "../../UserOperation.sol";
import "../../wallet/Wallet.sol";
import "../../paymaster/IPaymaster.sol";

contract EntryPointMock {
  Wallet public wallet;
  bool public revertOnReceive;

  function setWallet(Wallet _wallet) external {
    wallet = _wallet;
  }

  function mockReceiveRevert(bool fail) external {
    revertOnReceive = fail;
  }

  function validateUserOp(
    UserOperation calldata op,
    bytes32 requestId,
    uint256 requiredPrefund
  ) external {
    wallet.validateUserOp(op, requestId, requiredPrefund);
  }

  function executeUserOp(
    address to,
    uint256 value,
    bytes calldata data
  ) external {
    wallet.executeUserOp(to, value, data);
  }

  function postOp(
    PostOpMode mode,
    bytes calldata context,
    uint256 actualGasCost
  ) external {
    wallet.postOp(mode, context, actualGasCost);
  }

  function transferOwner(address to) external {
    wallet.transferOwner(to);
  }

  function grantGuardian(address to) external {
    wallet.grantGuardian(to);
  }

  function revokeGuardian(address to) external {
    wallet.revokeGuardian(to);
  }

  function upgradeTo(address implementation) external {
    wallet.upgradeTo(implementation);
  }

  receive() external payable {
    require(!revertOnReceive, "ENTRY_POINT_RECEIVE_FAILED");
  }
}
