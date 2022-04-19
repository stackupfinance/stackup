// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeCast.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./IEntryPointStaking.sol";
import "../UserOperation.sol";
import "../helpers/Calls.sol";

contract Staking is IEntryPointStaking {
  using SafeCast for uint256;
  using SafeMath for uint256;
  using Calls for address payable;

  struct Deposit {
    uint256 amount;
    uint32 unstakeDelaySec;
    uint64 withdrawTime;
  }

  uint32 public immutable unstakeDelaySec;

  mapping(address => Deposit) private deposits;

  constructor(uint32 _unstakeDelaySec) {
    unstakeDelaySec = _unstakeDelaySec;
  }

  receive() external payable {
    // solhint-disable-previous-line no-empty-blocks
  }

  function getDeposit(address account) external view returns (Deposit memory) {
    return deposits[account];
  }

  function balanceOf(address account) external view override returns (uint256) {
    return deposits[account].amount;
  }

  function hasDeposited(address account, uint256 amount) public view returns (bool) {
    return deposits[account].amount >= amount;
  }

  function isStaked(address account) public view returns (bool) {
    Deposit storage deposit = deposits[account];
    return deposit.unstakeDelaySec > 0 && deposit.withdrawTime == 0;
  }

  function isUnstaking(address account) public view returns (bool) {
    Deposit storage deposit = deposits[account];
    return deposit.unstakeDelaySec > 0 && deposit.withdrawTime > 0;
  }

  function canWithdraw(address account) public view returns (bool) {
    Deposit storage deposit = deposits[account];
    return deposit.unstakeDelaySec == 0 || (isUnstaking(account) && deposit.withdrawTime <= block.timestamp);
  }

  function depositTo(address account) external payable override {
    Deposit storage deposit = deposits[account];
    deposit.amount = deposit.amount + msg.value;
  }

  function addStake(uint32 _unstakeDelaySec) external payable override {
    Deposit storage deposit = deposits[msg.sender];
    require(_unstakeDelaySec >= unstakeDelaySec, "Staking: Low unstake delay");

    deposit.amount = deposit.amount + msg.value;
    deposit.unstakeDelaySec = _unstakeDelaySec;
    deposit.withdrawTime = 0;
  }

  function unlockStake() external override {
    require(!isUnstaking(msg.sender), "Staking: Unstaking in progress");
    require(isStaked(msg.sender), "Staking: Deposit not staked yet");

    Deposit storage deposit = deposits[msg.sender];
    // solhint-disable-next-line not-rely-on-time
    deposit.withdrawTime = (block.timestamp + deposit.unstakeDelaySec).toUint64();
  }

  function withdrawStake(address payable recipient) external override {
    withdrawTo(recipient, deposits[msg.sender].amount);
  }

  function withdrawTo(address payable recipient, uint256 amount) public override {
    require(amount > 0, "Staking: Withdraw amount zero");
    require(canWithdraw(msg.sender), "Staking: Cannot withdraw");

    Deposit storage deposit = deposits[msg.sender];
    deposit.unstakeDelaySec = 0;
    deposit.withdrawTime = 0;
    deposit.amount = deposit.amount.sub(amount, "Staking: Insufficient deposit");

    recipient.sendValue(amount, "Staking: Withdraw failed");
  }

  function _increaseStake(address account, uint256 amount) internal {
    Deposit storage deposit = deposits[account];
    deposit.amount = deposit.amount + amount;
  }

  function _decreaseStake(address account, uint256 amount) internal {
    Deposit storage deposit = deposits[account];
    deposit.amount = deposit.amount.sub(amount, "Staking: Insufficient stake");
  }
}
