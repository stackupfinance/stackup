import { BigNumber } from 'ethers'

import { bn } from '../../helpers/numbers'
import { BigNumberish } from '../../types'
import { ZERO_ADDRESS } from '../../helpers/constants'

export type Signature = {
  signer: string;
  signature: string;
}

export type UserOp = {
  sender: string;
  nonce: number;
  initCode: string;
  callData: string;
  callGas: BigNumberish;
  verificationGas: BigNumberish;
  preVerificationGas: BigNumberish;
  maxFeePerGas: BigNumberish;
  maxPriorityFeePerGas: BigNumberish;
  paymaster: string;
  paymasterData: string;
  signature: string;
}

export type UserOpParams = {
  sender?: string;
  nonce?: number;
  initCode?: string;
  callData?: string;
  callGas?: BigNumber;
  verificationGas?: BigNumber;
  preVerificationGas?: BigNumber;
  maxFeePerGas?: BigNumber;
  maxPriorityFeePerGas?: BigNumber;
  paymaster?: string;
  paymasterData?: string;
  signature?: string;
}

export function buildOp(params?: UserOpParams): UserOp {
  return {
    sender: params?.sender ?? ZERO_ADDRESS,
    nonce: params?.nonce ?? 0,
    initCode: params?.initCode ?? '0x',
    callData: params?.callData ?? '0x',
    callGas: params?.callGas ?? bn(0),
    verificationGas: params?.verificationGas ?? bn(0),
    preVerificationGas: params?.preVerificationGas ?? bn(0),
    maxFeePerGas: params?.maxFeePerGas ?? bn(0),
    maxPriorityFeePerGas: params?.maxPriorityFeePerGas ?? bn(0),
    paymaster: params?.paymaster ?? ZERO_ADDRESS,
    paymasterData: params?.paymasterData ?? '0x',
    signature: params?.signature ?? '0x',
  }
}
