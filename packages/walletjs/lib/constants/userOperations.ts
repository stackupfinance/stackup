import { ethers } from "ethers";

const _defaultGas = 215000;
const _defaultMaxFee = 50000000000; // 50 Gwei
const _initNonce = 0;
const _nullCode = "0x";

export interface IUserOperation {
  sender: string;
  nonce: number;
  initCode: string;
  callData: string;
  callGas: number;
  verificationGas: number;
  preVerificationGas: number;
  maxFeePerGas: number;
  maxPriorityFeePerGas: number;
  paymaster: string;
  paymasterData: string;
  signature: string;
}

export const defaultGas = _defaultGas;
export const defaultMaxFee = _defaultMaxFee;
export const defaultMaxPriorityFee = _defaultMaxFee;
export const initNonce = _initNonce;
export const nullCode = _nullCode;

export const defaults: IUserOperation = {
  sender: ethers.constants.AddressZero,
  nonce: _initNonce,
  initCode: _nullCode,
  callData: _nullCode,
  callGas: _defaultGas,
  verificationGas: _defaultGas,
  preVerificationGas: _defaultGas,
  maxFeePerGas: _defaultMaxFee,
  maxPriorityFeePerGas: _defaultMaxFee,
  paymaster: ethers.constants.AddressZero,
  paymasterData: _nullCode,
  signature: _nullCode,
};
