// SPDX-License-Identifier: AGPL-3.0

pragma solidity 0.8.9;

/**
 * @title Singleton Factory (EIP-2470)
 * @notice Exposes CREATE2 (EIP-1014) to deploy bytecode on deterministic addresses based on initialization code and salt.
 * @author Ricardo Guilherme Schmidt (Status Research & Development GmbH)
 */
interface ISingletonFactory {
  /**
   * @notice Deploys `_initCode` using `_salt` for defining the deterministic address.
   * @param _initCode Initialization code.
   * @param _salt Arbitrary value to modify resulting address.
   * @return createdContract Created contract address.
   */
  function deploy(bytes memory _initCode, bytes32 _salt) external returns (address payable createdContract);
}
