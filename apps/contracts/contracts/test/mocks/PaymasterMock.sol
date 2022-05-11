// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

import "../../paymaster/IPaymaster.sol";
import "../../entrypoint/IEntryPoint.sol";

contract PaymasterMock is IPaymaster {
  IEntryPoint internal entryPoint;
  uint32 internal unstakeDelaySec;

  bool internal mockPayRefund;
  bool internal mockRevertVerification;
  bool internal mockRevertPostOp;

  event PostOp(PostOpMode mode, bytes context, uint256 actualGasCost);

  constructor(IEntryPoint _entryPoint, uint32 _unstakeDelaySec) {
    entryPoint = _entryPoint;
    unstakeDelaySec = _unstakeDelaySec;
    mockPayRefund = true;
    mockRevertVerification = false;
    mockRevertPostOp = false;
  }

  function mockRefundPayment(bool _mockPayRefund) external {
    mockPayRefund = _mockPayRefund;
  }

  function mockVerificationRevert(bool _mockRevertVerification) external {
    mockRevertVerification = _mockRevertVerification;
  }

  function mockPostOpRevert(bool _mockRevertPostOp) external {
    mockRevertPostOp = _mockRevertPostOp;
  }

  receive() external payable {
    // solhint-disable-previous-line no-empty-blocks
  }

  function deposit() external payable {
    entryPoint.depositTo{ value: msg.value }(address(this));
  }

  function stake() external payable {
    entryPoint.addStake{ value: msg.value }(unstakeDelaySec);
  }

  function unlock() external {
    entryPoint.unlockStake();
  }

  function withdraw() external {
    entryPoint.withdrawStake(payable(address(this)));
  }

  function validatePaymasterUserOp(
    UserOperation calldata,
    bytes32,
    uint256
  ) external view override returns (bytes memory) {
    require(!mockRevertVerification, "PAYMASTER_VERIFICATION_FAILED");
    return new bytes(0);
  }

  function postOp(
    PostOpMode mode,
    bytes calldata context,
    uint256 actualGasCost
  ) external override {
    require(mode == PostOpMode.postOpReverted || !mockRevertPostOp, "PAYMASTER_POST_OP_FAILED");
    emit PostOp(mode, context, actualGasCost);
  }
}
