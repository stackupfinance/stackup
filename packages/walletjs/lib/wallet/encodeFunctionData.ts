import { ethers, BigNumberish, BytesLike } from "ethers";
import * as ERC20 from "../contracts/erc20";
import * as EntryPoint from "../contracts/entryPoint";
import * as Wallet from "../contracts/wallet";
import * as userOperations from "../constants/userOperations";
import * as staking from "../constants/staking";

export const ERC20Approve = (
  tokenAddress: string,
  spender: string,
  value: BigNumberish
) => {
  return Wallet.interface.encodeFunctionData("executeUserOp", [
    tokenAddress,
    0,
    ERC20.interface.encodeFunctionData("approve", [spender, value]),
  ]);
};

export const ERC20Transfer = (
  tokenAddress: string,
  to: string,
  value: BigNumberish
) => {
  return Wallet.interface.encodeFunctionData("executeUserOp", [
    tokenAddress,
    0,
    ERC20.interface.encodeFunctionData("transfer", [to, value]),
  ]);
};

export const executeUserOp = (
  to: string,
  value?: BigNumberish,
  data?: BytesLike
) => {
  return Wallet.interface.encodeFunctionData("executeUserOp", [
    to,
    value ?? ethers.constants.Zero,
    data ?? userOperations.nullCode,
  ]);
};

export const initialize = (owner: string, guardians: Array<string>) => {
  return Wallet.interface.encodeFunctionData("initialize", [owner, guardians]);
};

export const transferOwner = (newOwner: string) => {
  return Wallet.interface.encodeFunctionData("transferOwner", [newOwner]);
};

export const grantGuardian = (guardian: string) => {
  return Wallet.interface.encodeFunctionData("grantGuardian", [guardian]);
};

export const revokeGuardian = (guardian: string) => {
  return Wallet.interface.encodeFunctionData("revokeGuardian", [guardian]);
};

export const addEntryPointStake = (value: BigNumberish) => {
  return Wallet.interface.encodeFunctionData("executeUserOp", [
    EntryPoint.address,
    typeof value === "string"
      ? ethers.utils.parseEther(value)
      : ethers.BigNumber.from(value),
    EntryPoint.interface.encodeFunctionData("addStake", [
      ethers.BigNumber.from(staking.default_unlock_delay_sec),
    ]),
  ]);
};

export const upgradeTo = (newImplementation: string) => {
  return Wallet.interface.encodeFunctionData("upgradeTo", [newImplementation]);
};
