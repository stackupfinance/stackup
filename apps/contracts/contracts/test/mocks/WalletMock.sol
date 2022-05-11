// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

import "@openzeppelin/contracts/utils/Address.sol";

import "../../UserOperation.sol";
import "../../wallet/IWallet.sol";
import "../../helpers/Calls.sol";

contract WalletMock is IWallet {
  using Calls for address;

  bool internal mockPayRefund;
  bool internal mockRevertVerification;

  event ValidateUserOp(UserOperation op, bytes32 requestId, uint256 requiredPrefund);

  constructor(bool _mockRevertVerification, bool _mockPayRefund) {
    mockPayRefund = _mockPayRefund;
    mockRevertVerification = _mockRevertVerification;
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

  function validateUserOp(
    UserOperation calldata op,
    bytes32 requestId,
    uint256 requiredPrefund
  ) external override {
    require(!mockRevertVerification, "WALLET_VERIFICATION_FAILED");
    if (mockPayRefund) Address.sendValue(payable(address(msg.sender)), requiredPrefund);
    emit ValidateUserOp(op, requestId, requiredPrefund);
  }

  function executeUserOp(
    address to,
    uint256 value,
    bytes calldata data
  ) external override {
    to.callWithValue(data, value, "WALLET_EXECUTION_FAILED");
  }
}
