import { ethers } from "ethers";
import source from "./source/ERC20.json";

// @ts-ignore
export const interface = new ethers.utils.Interface(source.abi);

export const getInstance = (
  tokenAddress: string,
  provider: ethers.providers.Provider
) => new ethers.Contract(tokenAddress, source.abi, provider);
