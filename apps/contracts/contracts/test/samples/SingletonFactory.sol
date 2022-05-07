// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

/**
 * @title Singleton Factory (EIP-2470)
 * @dev Extended version from EIP-2470 for testing purposes
 * @author Ricardo Guilherme Schmidt (Status Research & Development GmbH)
 */
contract SingletonFactory {
  event Deployed(address createdContract, bytes32 salt);

  /**
   * @notice Deploys `initCode` using `salt` for defining the deterministic address.
   * @param initCode Initialization code.
   * @param salt Arbitrary value to modify resulting address.
   * @return createdContract Created contract address.
   */
  function deploy(bytes memory initCode, bytes32 salt) public returns (address payable createdContract) {
    // solhint-disable-next-line no-inline-assembly
    assembly {
      createdContract := create2(0, add(initCode, 0x20), mload(initCode), salt)
    }
    emit Deployed(createdContract, salt);
  }
}
