import { ethers, network } from 'hardhat'

export async function currentTimestamp(): Promise<number> {
  let blockNumber = await ethers.provider.getBlockNumber()
  const prevBlock = await ethers.provider.getBlock(blockNumber)
  return prevBlock.timestamp
}

export async function advanceTime(increment: number): Promise<void> {
  const timestamp = await currentTimestamp()
  await network.provider.request({ method: 'evm_setNextBlockTimestamp', params: [timestamp + increment] })
}
