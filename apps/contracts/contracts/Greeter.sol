// TODO: Delete this. This was taken straight from docs to test CI

// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Greeter {
  string private greeting;

  constructor(string memory _greeting) {
    console.log("Deploying a Greeter with greeting:", _greeting);
    greeting = _greeting;
  }

  function greet() public view returns (string memory) {
    return greeting;
  }

  function setGreeting(string memory _greeting) public {
    console.log("Changing greeting from '%s' to '%s'", greeting, _greeting);
    greeting = _greeting;
  }
}
