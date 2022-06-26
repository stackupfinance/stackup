import { ethers } from "hardhat";
import { Contract, BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import { bn } from "./helpers/numbers";
import { ZERO_ADDRESS } from "./helpers/constants";

export type NAry<T> = T | Array<T>;

export type BigNumberish = string | number | BigNumber;

export type Account = string | { address: string };

export type TxParams = {
  from?: Account;
};
export type Signature = {
  signer: string;
  signature: string;
};

export type WalletDeployParams = PaymasterDeployParams;

export type PaymasterDeployParams = {
  owner?: SignerWithAddress;
  guardians?: SignerWithAddress[];
  entryPoint?: Contract;
};

export type PaymasterData = {
  mode: number;
  fee: BigNumberish;
  token: Contract;
  feed: Contract;
};

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
};

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
};

export function toAddress(account?: Account): string {
  if (!account) return ZERO_ADDRESS;
  return typeof account === "string" ? account : account.address;
}

export function toAddresses(accounts?: Account[]): string[] {
  return accounts ? accounts.map(toAddress) : [];
}

export function toArray<T>(nary: NAry<T>): T[] {
  return Array.isArray(nary) ? nary : [nary];
}

export function toBytes32(number: BigNumberish): string {
  return ethers.utils.hexZeroPad(ethers.utils.hexlify(number), 32);
}

export function buildOp(params?: UserOpParams): UserOp {
  return {
    sender: params?.sender ?? ZERO_ADDRESS,
    nonce: params?.nonce ?? 0,
    initCode: params?.initCode ?? "0x",
    callData: params?.callData ?? "0x",
    callGas: params?.callGas ?? bn(0),
    verificationGas: params?.verificationGas ?? bn(0),
    preVerificationGas: params?.preVerificationGas ?? bn(0),
    maxFeePerGas: params?.maxFeePerGas ?? bn(0),
    maxPriorityFeePerGas: params?.maxPriorityFeePerGas ?? bn(0),
    paymaster: params?.paymaster ?? ZERO_ADDRESS,
    paymasterData: params?.paymasterData ?? "0x",
    signature: params?.signature ?? "0x",
  };
}
