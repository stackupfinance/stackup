import { ethers } from 'hardhat'
import { BigNumber, Contract } from 'ethers'

import { Signature, UserOp } from '../models/user/types'
import { deploy, getFactory, getInterface } from './contracts'
import { Account, BigNumberish, NAry, toAddress, toAddresses, toArray } from '../types'

export async function encodeWalletDeployment(entryPoint: Account, owner: Account, guardians?: Account[], implementation?: Contract): Promise<string> {
  if (!implementation) implementation = await deploy('Wallet')
  const initData = await encodeWalletInit(entryPoint, owner, guardians)
  const proxyFactory = await getFactory('WalletProxy')
  const deployTx = proxyFactory.getDeployTransaction(implementation.address, initData)
  return (deployTx?.data || '0x').toString()
}

export async function encodeWalletInit(entryPoint: Account, owner: Account, guardians?: Account[]): Promise<string> {
  const walletInterface = await getInterface('Wallet')
  const args = [toAddress(entryPoint), toAddress(owner), toAddresses(guardians)]
  return walletInterface.encodeFunctionData('initialize', args)
}

export async function encodeWalletOwnerTransfer(to: Account): Promise<string> {
  const tokenInterface = await getInterface('Wallet')
  const args = [toAddress(to)]
  return tokenInterface.encodeFunctionData('transferOwner', args)
}

export async function encodeWalletValidateOp(op: UserOp, requestId: string, requiredPrefund: BigNumber): Promise<string> {
  const walletInterface = await getInterface('Wallet')
  const args = [op, requestId, requiredPrefund]
  return walletInterface.encodeFunctionData('validateUserOp', args)
}

export async function encodeWalletExecute(to: Account, data = '0x', value?: BigNumberish): Promise<string> {
  const walletInterface = await getInterface('Wallet')
  const args = [toAddress(to), value ?? 0, data]
  return walletInterface.encodeFunctionData('executeUserOp', args)
}

export async function encodeEntryPointStake(): Promise<string> {
  const entryPointInterface = await getInterface('EntryPoint')
  return entryPointInterface.encodeFunctionData('addStake')
}

export async function encodeEntryPointLock(): Promise<string> {
  const entryPointInterface = await getInterface('EntryPoint')
  return entryPointInterface.encodeFunctionData('lockStake')
}

export async function encodeEntryPointUnlock(): Promise<string> {
  const entryPointInterface = await getInterface('EntryPoint')
  return entryPointInterface.encodeFunctionData('unlockStake')
}

export async function encodeEntryPointWithdraw(amount: BigNumber): Promise<string> {
  const entryPointInterface = await getInterface('EntryPoint')
  return entryPointInterface.encodeFunctionData('withdrawStake', [amount])
}

export async function encodeCounterIncrement(): Promise<string> {
  const counterInterface = await getInterface('Counter')
  return counterInterface.encodeFunctionData('increment', [])
}

export async function encodeReverterFail(): Promise<string> {
  const reverterInterface = await getInterface('Reverter')
  return reverterInterface.encodeFunctionData('fail', [])
}

export async function encodeTokenApproval(to: Account, amount: BigNumberish): Promise<string> {
  const tokenInterface = await getInterface('ERC20')
  const args = [toAddress(to), amount.toString()]
  return tokenInterface.encodeFunctionData('approve', args)
}

export function encodeSignatures(type: number, signature: NAry<Signature>): string {
  const params = [type, toArray(signature)]
  return ethers.utils.defaultAbiCoder.encode(['uint8', '(address signer, bytes signature)[]'], params)
}

export function encodePaymasterSignature(fee: BigNumberish, token: Contract, feed: Contract, signature: string): string {
  const params = [fee, toAddress(token), toAddress(feed), signature]
  return ethers.utils.defaultAbiCoder.encode(['uint256', 'address', 'address', 'bytes'], params)
}

export function encodeRequestId(op: UserOp, entryPoint: Account, chainId: number): string {
  const params = [encodeOp(op), toAddress(entryPoint), chainId]
  return ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['bytes32', 'address', 'uint'], params))
}

export function encodeOp(op: UserOp): string {
  return ethers.utils.keccak256(
    ethers.utils.solidityPack(
      [
        'address',
        'uint256',
        'bytes32',
        'bytes32',
        'uint256',
        'uint256',
        'uint256',
        'uint256',
        'uint256',
        'address',
        'bytes32',
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
  )
}

export function encodePaymasterData(op: UserOp, fee: BigNumberish, token: Contract, feed: Contract): string {
  return ethers.utils.keccak256(
    ethers.utils.solidityPack(
      [
        'address',
        'uint256',
        'bytes32',
        'bytes32',
        'uint256',
        'uint256',
        'uint256',
        'uint256',
        'uint256',
        'address',
        'bytes32',
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
            ['uint256', 'address', 'address'],
            [fee.toString(), toAddress(token), toAddress(feed)]
          )
        ),
      ]
    )
  )
}
