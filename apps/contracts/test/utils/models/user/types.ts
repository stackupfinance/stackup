import { BigNumber } from 'ethers'
import { BigNumberish } from '../../types'

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
