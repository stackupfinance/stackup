import { ethers, network } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { BigNumber, ContractReceipt, ContractTransaction } from 'ethers'

import { bn } from './helpers/numbers'
import { getInterface, instanceAt } from './helpers/contracts'
import { BigNumberish, Account, toAddress } from './types'

const WETH = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"
const UNISWAP_V2 = "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff"

export const DEFAULT_REQUIRED_PRE_FUND = ethers.BigNumber.from(215000 * 3).mul(ethers.BigNumber.from(50000000000))
export const PAYMASTER_FEE = ethers.BigNumber.from(100000)
export const PAYMASTER_LOCK_EXPIRY_PERIOD = 172800 // 2 Days
export const USDC_DECIMALS = ethers.BigNumber.from(6)
export const USDC_PRICE_FEED = "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0"
export const USDC_TOKEN = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"

export const PAYMASTER_OPTS = [PAYMASTER_FEE, USDC_TOKEN, USDC_PRICE_FEED]
export const PAYMASTER_OPTS_NO_FEE = [0, USDC_TOKEN, USDC_PRICE_FEED]

export const MOCK_POST_OP_ACTUAL_GAS = ethers.utils.parseEther("0.0005")
export const MOCK_POST_OP_EXCHANGE_RATE = ethers.BigNumber.from("1847619")
export const MOCK_POST_OP_TOKEN_FEE = MOCK_POST_OP_ACTUAL_GAS.mul(MOCK_POST_OP_EXCHANGE_RATE)
  .mul(ethers.BigNumber.from("10").pow(USDC_DECIMALS))
  .div(
    ethers.constants.WeiPerEther.mul(
      ethers.BigNumber.from("10").pow(USDC_DECIMALS)
    )
  )
  .add(PAYMASTER_FEE)

export async function encodeFailContractCall(): Promise<string> {
  const testInterface = await getInterface('Test')
  return testInterface.encodeFunctionData("func", [false])
}

export async function encodeFailEntryPointCall(testContract: string): Promise<string> {
  const walletInterface = await getInterface('Wallet')
  const data = await encodeFailContractCall();
  return walletInterface.encodeFunctionData("executeUserOp", [testContract, 0, data])
}

export async function encodePassContractCall(): Promise<string> {
  const testInterface = await getInterface('Test')
  return testInterface.encodeFunctionData("func", [true])
}

export async function encodePassEntryPointCall(testContract: string): Promise<string> {
  const walletInterface = await getInterface('Wallet')
  const data = await encodePassContractCall()
  return walletInterface.encodeFunctionData("executeUserOp", [testContract, 0, data])
}

export async function getAddressBalances(addresses: Account[]): Promise<BigNumber[]> {
  return Promise.all(addresses.map((addr) => ethers.provider.getBalance(toAddress(addr))))
}

export async function getLastBlockTimestamp(): Promise<number> {
  let blockNumber = await ethers.provider.getBlockNumber()
  const prevBlock = await ethers.provider.getBlock(blockNumber)
  return prevBlock.timestamp
}

export async function incrementBlockTimestamp(increment = 0): Promise<void> {
  const timestamp = await getLastBlockTimestamp()
  await network.provider.request({ method: "evm_setNextBlockTimestamp", params: [timestamp + increment] })
}

export function mockPostOpArgs(sender: string): any {
  return [
    0,
    ethers.utils.defaultAbiCoder.encode(
      ["address", "address", "uint256", "uint256"],
      [sender, USDC_TOKEN, MOCK_POST_OP_EXCHANGE_RATE, PAYMASTER_FEE]
    ),
    MOCK_POST_OP_ACTUAL_GAS,
  ]
}

export async function sendEth(from: SignerWithAddress, to: Account, value: BigNumber): Promise<ContractTransaction> {
  return from.sendTransaction({ to: toAddress(to), value })
}

export async function swapEthForToken(from: SignerWithAddress, to: Account, token: string, value: BigNumberish): Promise<ContractTransaction> {
  const path = [WETH, token]
  const uniswap = await instanceAt('IUniswapV2Router02', UNISWAP_V2)
  const amountsOut = await uniswap.connect(from).getAmountsOut(value, path)
  const amountOutMin = amountsOut[1].mul(bn(9950)).div(bn(10000)) //0.5% slippage
  return uniswap.connect(from).swapExactETHForTokens(
    amountOutMin,
    path,
    to,
    (await getLastBlockTimestamp()) + 300,
    { value: value.toString() }
  )
}

export function transactionFee(tx: ContractReceipt): BigNumber {
  return tx.effectiveGasPrice.mul(tx.gasUsed)
}
