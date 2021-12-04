// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract WalletProxy is ERC1967Proxy {
  // solhint-disable-next-line no-empty-blocks
  constructor(address _logic, bytes memory _data) ERC1967Proxy(_logic, _data) {}
}
