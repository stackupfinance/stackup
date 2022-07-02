import axios from "axios";
import { ethers } from "ethers";
import { Env, Networks, NetworksConfig } from "../config";

interface BlockPrices {
  estimatedPrices: Array<{
    maxPriorityFeePerGas: number;
    maxFeePerGas: number;
  }>;
}

interface GasPricesResponse {
  unit: string;
  blockPrices: Array<BlockPrices>;
}

export const getGasEstimate = async (network: Networks) => {
  const response = await axios.get<GasPricesResponse>(
    "https://api.blocknative.com/gasprices/blockprices",
    {
      headers: { Authorization: Env.BLOCKNATIVE_API_KEY },
      params: { chainid: NetworksConfig[network].chainId },
    }
  );

  const units = response.data.unit;
  const estimatedPrice = response.data.blockPrices[0].estimatedPrices[0];
  return {
    maxPriorityFeePerGas: ethers.utils
      .parseUnits(estimatedPrice.maxPriorityFeePerGas.toString(), units)
      .toString(),
    maxFeePerGas: ethers.utils
      .parseUnits(estimatedPrice.maxFeePerGas.toString(), units)
      .toString(),
  };
};
