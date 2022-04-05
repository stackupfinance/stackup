// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.0;

import "./IEntryPointStaking.sol";
import "../UserOperation.sol";
import "../helpers/Calls.sol";

contract Staking is IEntryPointStaking {
  using Calls for address payable;

  uint256 public constant LOCK_DELAY = 2 days;

  struct Stake {
    uint256 value;
    uint256 lockExpiryTime;
    bool isLocked;
  }

  mapping(address => Stake) private _stakedBalances;

  receive() external payable {
    // solhint-disable-previous-line no-empty-blocks
  }

  function addStake() external payable override {
    Stake storage stake = _getStake(msg.sender);
    stake.value += msg.value;
  }

  function lockStake() external override {
    // solhint-disable not-rely-on-time
    Stake storage stake = _getStake(msg.sender);
    stake.isLocked = true;
    stake.lockExpiryTime = block.timestamp + LOCK_DELAY;
  }

  function unlockStake() external override {
    // solhint-disable not-rely-on-time
    Stake storage stake = _getStake(msg.sender);
    require(stake.lockExpiryTime <= block.timestamp, "EntryPoint: Lock not expired");
    stake.lockExpiryTime = 0;
    stake.isLocked = false;
  }

  function withdrawStake(address payable recipient) external override {
    Stake storage stake = _getStake(msg.sender);
    require(!stake.isLocked, "EntryPoint: Stake is locked");
    uint256 value = stake.value;
    stake.value = 0;
    recipient.sendValue(value, "EntryPoint: Withdraw value failed");
  }

  function getStake(address paymaster) external view returns (Stake memory) {
    return _getStake(paymaster);
  }

  function _getStake(address paymaster) internal view returns (Stake storage) {
    return _stakedBalances[paymaster];
  }
}
