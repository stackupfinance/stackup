// SPDX-License-Identifier: AGPL-3.0

pragma solidity ^0.8.0;

import "../UserOperation.sol";

/**
 * @dev EntryPointStaking interface specified in https://eips.ethereum.org/EIPS/eip-4337
 */
interface IEntryPointStaking {
  function addStake() external payable;

  function lockStake() external;

  function unlockStake() external;

  function withdrawStake(address payable recipient) external;
}
