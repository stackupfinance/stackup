import { ethers } from "ethers";

export const magicValue = new ethers.utils.Interface([
  "function isValidSignature(bytes32 _hash, bytes memory _signature) public view returns (bytes4 magicValue)",
]).getSighash("isValidSignature");
