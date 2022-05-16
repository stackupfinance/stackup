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

  /**
   * @dev Struct of deposits information for each account
   * @param amount deposited for an account
   * @param unstakeDelaySec delay picked for the unstaking process, zero means the account hasn't staked yet
   * @param withdrawTime timestamp when the account will be allowed to withdraw their deposited funds, zero means anytime
   */
  struct Deposit {
    uint256 amount;
    uint32 unstakeDelaySec;
    uint64 withdrawTime;
  }

  event Deposited(address indexed account, uint256 deposited);
  event StakeLocked(address indexed account, uint256 deposited, uint256 unstakeDelaySec);
  event StakeUnlocked(address indexed account, uint64 withdrawTime);
  event Withdrawn(address indexed account, address recipient, uint256 deposited, uint256 amount);

  // unstaking delay that will be forced to each account
  uint32 public immutable unstakeDelaySec;

  // deposits list indexed by account address
  mapping(address => Deposit) private deposits;

  /**
   * @dev Staking constructor
   * @param _unstakeDelaySec unstaking delay that will be forced to each account
   */
  constructor(uint32 _unstakeDelaySec) {
    unstakeDelaySec = _unstakeDelaySec;
  }

  /**
   * @dev Allows receiving ETH transfers
   */
  receive() external payable {
    // solhint-disable-previous-line no-empty-blocks
  }

  /**
   * @dev Tells the entire deposit information for an account
   */
  function getDeposit(address account) external view returns (Deposit memory) {
    return deposits[account];
  }

  /**
   * @dev Tells the total amount deposited for an account
   */
  function balanceOf(address account) external view override returns (uint256) {
    return deposits[account].amount;
  }

  /**
   * @dev Tells is account has deposited balance or not
   */
  function hasDeposited(address account, uint256 amount) public view returns (bool) {
    return deposits[account].amount >= amount;
  }

  /**
   * @dev Tells if an account has it's deposited balance staked or not
   */
  function isStaked(address account) public view returns (bool) {
    Deposit storage deposit = deposits[account];
    return deposit.unstakeDelaySec > 0 && deposit.withdrawTime == 0;
  }

  /**
   * @dev Tells if an account has started it's unstaking process or not
   */
  function isUnstaking(address account) public view returns (bool) {
    Deposit storage deposit = deposits[account];
    return deposit.unstakeDelaySec > 0 && deposit.withdrawTime > 0;
  }

  /**
   * @dev Tells if an account is allowed to withdraw its deposits or not
   */
  function canWithdraw(address account) public view returns (bool) {
    Deposit storage deposit = deposits[account];
    // solhint-disable-next-line not-rely-on-time
    return deposit.unstakeDelaySec == 0 || (isUnstaking(account) && deposit.withdrawTime <= block.timestamp);
  }

  /**
   * @dev Deposits value to an account. It will deposit the entire msg.value sent to the function.
   * @param account willing to deposit the value to
   */
  function depositTo(address account) external payable override {
    Deposit storage deposit = deposits[account];
    uint256 deposited = deposit.amount + msg.value;
    deposit.amount = deposited;
    emit Deposited(account, deposited);
  }

  /**
   * @dev Stakes the sender's deposits. It will deposit the entire msg.value sent to the function and mark it as staked.
   * @param _unstakeDelaySec unstaking delay that will be forced to the account, it can only be greater than or
   * equal to the one set in the contract
   */
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

  /**
   * @dev Starts the unlocking process for the sender.
   * It sets the withdraw time based on the unstaking delay previously set for the account.
   */
  function unlockStake() external override {
    require(!isUnstaking(msg.sender), "Staking: Unstaking in progress");
    require(isStaked(msg.sender), "Staking: Deposit not staked yet");

    Deposit storage deposit = deposits[msg.sender];
    // solhint-disable-next-line not-rely-on-time
    uint64 withdrawTime = (block.timestamp + deposit.unstakeDelaySec).toUint64();
    deposit.withdrawTime = withdrawTime;
    emit StakeUnlocked(msg.sender, withdrawTime);
  }

  /**
   * @dev Withdraws the entire deposited balance of the sender to a recipient.
   * Essentially, the withdraw time must be zero or in the past.
   */
  function withdrawStake(address payable recipient) external override {
    withdrawTo(recipient, deposits[msg.sender].amount);
  }

  /**
   * @dev Withdraws the part of the deposited balance of the sender to a recipient.
   * Essentially, the withdraw time must be zero or in the past.
   */
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

  /**
   * @dev Internal function to increase an account's staked balance
   */
  function _increaseStake(address account, uint256 amount) internal {
    Deposit storage deposit = deposits[account];
    deposit.amount = deposit.amount + amount;
  }

  /**
   * @dev Internal function to decrease an account's staked balance
   */
  function _decreaseStake(address account, uint256 amount) internal {
    Deposit storage deposit = deposits[account];
    deposit.amount = deposit.amount.sub(amount, "Staking: Insufficient stake");
  }
}
