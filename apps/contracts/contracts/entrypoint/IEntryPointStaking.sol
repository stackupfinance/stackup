// SPDX-License-Identifier: AGPL-3.0

pragma solidity 0.8.9;

import "../UserOperation.sol";

/**
 * @dev EntryPointStaking interface specified in https://eips.ethereum.org/EIPS/eip-4337
 */
interface IEntryPointStaking {
  // return the deposit of an account
  function balanceOf(address account) external view returns (uint256);

  // add to the deposit of the given account
  function depositTo(address account) external payable;

  // add a paymaster stake (must be called by the paymaster)
  function addStake(uint32 _unstakeDelaySec) external payable;

  // unlock the stake (must wait unstakeDelay before can withdraw)
  function unlockStake() external;

  // withdraw the unlocked stake
  function withdrawStake(address payable withdrawAddress) external;

  // withdraw from the deposit
  function withdrawTo(address payable withdrawAddress, uint256 withdrawAmount) external;
}
