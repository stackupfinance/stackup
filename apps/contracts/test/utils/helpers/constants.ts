import { ethers } from "hardhat";

import { maxUint } from "./numbers";

export const MAX_UINT256 = maxUint(256);
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const ZERO_BYTES32 =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export const ADMIN_ROLE = ZERO_BYTES32;
export const OWNER_ROLE = ethers.utils.solidityKeccak256(
  ["string"],
  ["OWNER_ROLE"]
);
export const GUARDIAN_ROLE = ethers.utils.solidityKeccak256(
  ["string"],
  ["GUARDIAN_ROLE"]
);

export const POST_OP_MODE_OK = 0;
export const POST_OP_MODE_FAIL = 1;
export const POST_OP_MODE_OP_FAIL = 2;

export const PAYMASTER_MODE_FULL = 0;
export const PAYMASTER_MODE_FEE_ONLY = 1;
export const PAYMASTER_MODE_GAS_ONLY = 2;
export const PAYMASTER_MODE_FREE = 3;
