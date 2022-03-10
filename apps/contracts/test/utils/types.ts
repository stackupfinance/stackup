import { BigNumber } from 'ethers'

export type BigNumberish = string | number | BigNumber

export type Account = string | { address: string }

export function toAddress(account: Account): string {
  return typeof account === 'string' ? account : account.address
}

export function toAddresses(accounts: Account[]): string[] {
  return accounts.map(toAddress)
}
