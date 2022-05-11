// SPDX-License-Identifier: AGPL-3.0

pragma solidity 0.8.9;

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

  event Deposited(address indexed account, uint256 deposited);
  event StakeLocked(address indexed account, uint256 deposited, uint256 unstakeDelaySec);
  event StakeUnlocked(address indexed account, uint64 withdrawTime);
  event Withdrawn(address indexed account, address recipient, uint256 deposited, uint256 amount);

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
    // solhint-disable-next-line not-rely-on-time
    return deposit.unstakeDelaySec == 0 || (isUnstaking(account) && deposit.withdrawTime <= block.timestamp);
  }

  function depositTo(address account) external payable override {
    Deposit storage deposit = deposits[account];
    uint256 deposited = deposit.amount + msg.value;
    deposit.amount = deposited;
    emit Deposited(account, deposited);
  }

  function addStake(uint32 _unstakeDelaySec) external payable override {
    Deposit storage deposit = deposits[msg.sender];
    require(_unstakeDelaySec >= unstakeDelaySec, "Staking: Low unstake delay");
    require(_unstakeDelaySec >= deposit.unstakeDelaySec, "Staking: Decreasing unstake time");

    uint256 deposited = deposit.amount + msg.value;
    deposit.amount = deposited;
    deposit.unstakeDelaySec = _unstakeDelaySec;
    deposit.withdrawTime = 0;
    emit StakeLocked(msg.sender, deposited, unstakeDelaySec);
  }

  function unlockStake() external override {
    require(!isUnstaking(msg.sender), "Staking: Unstaking in progress");
    require(isStaked(msg.sender), "Staking: Deposit not staked yet");

    Deposit storage deposit = deposits[msg.sender];
    // solhint-disable-next-line not-rely-on-time
    uint64 withdrawTime = (block.timestamp + deposit.unstakeDelaySec).toUint64();
    deposit.withdrawTime = withdrawTime;
    emit StakeUnlocked(msg.sender, withdrawTime);
  }

  function withdrawStake(address payable recipient) external override {
    withdrawTo(recipient, deposits[msg.sender].amount);
  }

  function withdrawTo(address payable recipient, uint256 amount) public override {
    require(amount > 0, "Staking: Withdraw amount zero");
    require(canWithdraw(msg.sender), "Staking: Cannot withdraw");

    Deposit storage deposit = deposits[msg.sender];
    uint256 deposited = deposit.amount.sub(amount, "Staking: Insufficient deposit");
    deposit.unstakeDelaySec = 0;
    deposit.withdrawTime = 0;
    deposit.amount = deposited;

    recipient.sendValue(amount, "Staking: Withdraw failed");
    emit Withdrawn(msg.sender, recipient, deposited, amount);
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
