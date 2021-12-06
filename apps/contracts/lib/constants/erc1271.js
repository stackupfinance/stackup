const { ethers } = require("ethers");

module.exports.magicValue = new ethers.utils.Interface([
  "function isValidSignature(bytes32 _hash, bytes memory _signature) public view returns (bytes4 magicValue)",
]).getSighash("isValidSignature");
