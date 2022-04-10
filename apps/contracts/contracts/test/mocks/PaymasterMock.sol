// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../paymaster/IPaymaster.sol";
import "../../entrypoint/IEntryPoint.sol";

contract PaymasterMock is IPaymaster {
  IEntryPoint internal entryPoint;

  bool internal mockPayRefund;
  bool internal mockRevertVerification;

  event PostOp(PostOpMode mode, bytes context, uint256 actualGasCost);

  constructor(IEntryPoint _entryPoint) {
    entryPoint = _entryPoint;
    mockPayRefund = true;
    mockRevertVerification = false;
  }

  function mockRefundPayment(bool _mockPayRefund) external {
    mockPayRefund = _mockPayRefund;
  }

  function mockVerificationRevert(bool _mockRevertVerification) external {
    mockRevertVerification = _mockRevertVerification;
  }

  receive() external payable {
    // solhint-disable-previous-line no-empty-blocks
  }

  function stake() external payable {
    entryPoint.addStake{ value: msg.value }();
  }

  function lock() external {
    entryPoint.lockStake();
  }

  function unlock() external {
    entryPoint.unlockStake();
  }

  function unstake() external {
    entryPoint.withdrawStake(payable(address(this)));
  }

  function validatePaymasterUserOp(UserOperation calldata, uint256) external view override returns (bytes memory) {
    require(!mockRevertVerification, "PAYMASTER_VERIFICATION_FAILED");
    return new bytes(0);
  }

  function postOp(
    PostOpMode mode,
    bytes calldata context,
    uint256 actualGasCost
  ) external override {
    emit PostOp(mode, context, actualGasCost);
  }
}
