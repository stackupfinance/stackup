import { ethers } from "hardhat";
import { BigNumber, Contract } from "ethers";

import { deploy, getFactory, getInterface } from "./contracts";
import {
  Signature,
  UserOp,
  PaymasterData,
  Account,
  BigNumberish,
  NAry,
  toAddress,
  toAddresses,
  toArray,
} from "../types";

export async function encodeWalletMockDeployment(
  verificationReverts = false,
  payRefund = true
): Promise<string> {
  const walletFactory = await getFactory("WalletMock");
  const deployTx = walletFactory.getDeployTransaction(
    verificationReverts,
    payRefund
  );
  return (deployTx?.data || "0x").toString();
}

export async function encodeWalletDeployment(
  entryPoint: Account,
  owner: Account,
  guardians?: Account[]
): Promise<string> {
  const implementation = await deploy("Wallet", [toAddress(entryPoint)]);
  const initData = await encodeWalletInit(owner, guardians);
  const proxyFactory = await getFactory("WalletProxy");
  const deployTx = proxyFactory.getDeployTransaction(
    implementation.address,
    initData
  );
  return (deployTx?.data || "0x").toString();
}

export async function encodePaymasterInit(
  owner: Account,
  guardians?: Account[]
): Promise<string> {
  const paymasterInterface = await getInterface("Paymaster");
  const args = [toAddress(owner), toAddresses(guardians)];
  return paymasterInterface.encodeFunctionData("initialize", args);
}

export async function encodeWalletInit(
  owner: Account,
  guardians?: Account[]
): Promise<string> {
  const walletInterface = await getInterface("Wallet");
  const args = [toAddress(owner), toAddresses(guardians)];
  return walletInterface.encodeFunctionData("initialize", args);
}

export async function encodeWalletOwnerTransfer(to: Account): Promise<string> {
  const tokenInterface = await getInterface("Wallet");
  const args = [toAddress(to)];
  return tokenInterface.encodeFunctionData("transferOwner", args);
}

export async function encodeWalletValidateOp(
  op: UserOp,
  requestId: string,
  requiredPrefund: BigNumber
): Promise<string> {
  const walletInterface = await getInterface("Wallet");
  const args = [op, requestId, requiredPrefund];
  return walletInterface.encodeFunctionData("validateUserOp", args);
}

export async function encodeWalletExecute(
  to: Account,
  data = "0x",
  value?: BigNumberish
): Promise<string> {
  const walletInterface = await getInterface("Wallet");
  const args = [toAddress(to), value ?? 0, data];
  return walletInterface.encodeFunctionData("executeUserOp", args);
}

export async function encodeEntryPointDeposit(
  account: Account
): Promise<string> {
  const entryPointInterface = await getInterface("Staking");
  const args = [toAddress(account)];
  return entryPointInterface.encodeFunctionData("depositTo", args);
}

export async function encodeEntryPointStake(
  unstakeDelaySec: BigNumberish
): Promise<string> {
  const entryPointInterface = await getInterface("Staking");
  const args = [unstakeDelaySec.toString()];
  return entryPointInterface.encodeFunctionData("addStake", args);
}

export async function encodeCounterIncrement(): Promise<string> {
  const counterInterface = await getInterface("Counter");
  return counterInterface.encodeFunctionData("increment", []);
}

export async function encodeReverterFail(): Promise<string> {
  const reverterInterface = await getInterface("Reverter");
  return reverterInterface.encodeFunctionData("fail", []);
}

export async function encodeTokenApproval(
  to: Account,
  amount: BigNumberish
): Promise<string> {
  const tokenInterface = await getInterface("ERC20");
  const args = [toAddress(to), amount.toString()];
  return tokenInterface.encodeFunctionData("approve", args);
}

export function encodeSignatures(
  type: number,
  signature: NAry<Signature>
): string {
  const params = [type, toArray(signature)];
  return ethers.utils.defaultAbiCoder.encode(
    ["uint8", "(address signer, bytes signature)[]"],
    params
  );
}

export function encodePaymasterContext(
  sender: Account,
  mode: number,
  token: Contract,
  rate: BigNumberish,
  fee: BigNumberish
): string {
  const params = [
    toAddress(sender),
    mode,
    toAddress(token),
    rate.toString(),
    fee.toString(),
  ];
  return ethers.utils.defaultAbiCoder.encode(
    ["address", "uint8", "address", "uint256", "uint256"],
    params
  );
}

export function encodePaymasterData(
  paymasterData: PaymasterData,
  signature: string
): string {
  const params = [
    paymasterData.fee,
    paymasterData.mode,
    toAddress(paymasterData.token),
    toAddress(paymasterData.feed),
    signature,
  ];
  return ethers.utils.defaultAbiCoder.encode(
    ["uint256", "uint8", "address", "address", "bytes"],
    params
  );
}

export function encodeRequestId(
  op: UserOp,
  entryPoint: Account,
  chainId: number
): string {
  const params = [encodeOp(op), toAddress(entryPoint), chainId];
  return ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(["bytes32", "address", "uint"], params)
  );
}

export function encodeOp(op: UserOp): string {
  return ethers.utils.keccak256(
    ethers.utils.solidityPack(
      [
        "address",
        "uint256",
        "bytes32",
        "bytes32",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
        "address",
        "bytes32",
      ],
      [
        op.sender,
        op.nonce,
        ethers.utils.keccak256(op.initCode),
        ethers.utils.keccak256(op.callData),
        op.callGas,
        op.verificationGas,
        op.preVerificationGas,
        op.maxFeePerGas,
        op.maxPriorityFeePerGas,
        op.paymaster,
        ethers.utils.keccak256(op.paymasterData),
      ]
    )
  );
}

export function encodePaymasterRequest(
  op: UserOp,
  paymasterData: PaymasterData
): string {
  return ethers.utils.keccak256(
    ethers.utils.solidityPack(
      [
        "address",
        "uint256",
        "bytes32",
        "bytes32",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
        "address",
        "bytes32",
      ],
      [
        op.sender,
        op.nonce,
        ethers.utils.keccak256(op.initCode),
        ethers.utils.keccak256(op.callData),
        op.callGas,
        op.verificationGas,
        op.preVerificationGas,
        op.maxFeePerGas,
        op.maxPriorityFeePerGas,
        op.paymaster,
        ethers.utils.keccak256(
          ethers.utils.solidityPack(
            ["uint256", "uint8", "address", "address"],
            [
              paymasterData.fee.toString(),
              paymasterData.mode.toString(),
              toAddress(paymasterData.token),
              toAddress(paymasterData.feed),
            ]
          )
        ),
      ]
    )
  );
}
