import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import { ethers } from "ethers";
import { Env, Networks } from "../config";

const ALCHEMY_POLYGON_INSTANCE = createAlchemyWeb3(Env.ALCHEMY_POLYGON_RPC);

const getInstance = (network: Networks) => {
  switch (network) {
    case "Polygon":
      return ALCHEMY_POLYGON_INSTANCE;

    default:
      return ALCHEMY_POLYGON_INSTANCE;
  }
};

export const getBlockNumber = async (network: Networks) => {
  const web3 = getInstance(network);

  const data = await web3.eth.getBlockNumber();

  return data;
};

export const getTransactionReceipts = async (
  network: Networks,
  blockNumber: number
) => {
  const web3 = getInstance(network);

  const data = await web3.alchemy.getTransactionReceipts({
    blockNumber: ethers.utils.hexValue(blockNumber),
  });

  return data;
};
