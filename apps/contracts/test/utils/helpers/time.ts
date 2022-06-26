import { BigNumber } from "ethers";
import { ethers, network } from "hardhat";

import { bn } from "./numbers";
import { BigNumberish } from "../types";

export async function currentTimestamp(): Promise<BigNumber> {
  let blockNumber = await ethers.provider.getBlockNumber();
  const prevBlock = await ethers.provider.getBlock(blockNumber);
  return bn(prevBlock.timestamp);
}

export async function advanceTime(increment: BigNumberish): Promise<void> {
  const timestamp = await currentTimestamp();
  await network.provider.request({
    method: "evm_setNextBlockTimestamp",
    params: [timestamp.add(increment).toNumber()],
  });
}
