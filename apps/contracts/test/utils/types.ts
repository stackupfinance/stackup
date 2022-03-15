import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'

export type NAry<T> = T | Array<T>

export type BigNumberish = string | number | BigNumber

export type Account = string | { address: string }

export type TxParams = {
  from?: SignerWithAddress
}

export function toAddress(account: Account): string {
  return typeof account === 'string' ? account : account.address
}

export function toAddresses(accounts?: Account[]): string[] {
  return accounts ? accounts.map(toAddress) : []
}

export function toArray<T>(nary: NAry<T>): T[] {
  return Array.isArray(nary) ? nary : [nary]
}

export function toBytes32(number: BigNumberish): string {
  return ethers.utils.hexZeroPad(ethers.utils.hexlify(number), 32)
}
