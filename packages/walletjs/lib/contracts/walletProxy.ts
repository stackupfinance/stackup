import { ethers } from "ethers";
import source from "./source/WalletProxy.json";

export const factory = new ethers.ContractFactory(source.abi, source.bytecode);
