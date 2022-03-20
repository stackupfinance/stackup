import { ethers } from 'hardhat'

import { maxUint } from './numbers'

export const MAX_UINT256 = maxUint(256)
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
export const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000'

export const ADMIN_ROLE = ZERO_BYTES32
export const OWNER_ROLE = ethers.utils.solidityKeccak256(['string'], ['OWNER_ROLE'])
export const GUARDIAN_ROLE = ethers.utils.solidityKeccak256(['string'], ['GUARDIAN_ROLE'])
