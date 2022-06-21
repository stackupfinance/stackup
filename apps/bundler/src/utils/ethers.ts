import { ethers } from "ethers";
import { getRPC } from "./rpc";
import dotenv from "dotenv";
dotenv.config();
import { entrypointJSON as entryPointContractAbi } from "../../contracts/abi/entrypoint.js";
import { paymasterJSON as paymasterContractAbi } from "../../contracts/abi/paymaster.js";
import { walletJSON as walletContractAbi } from "../../contracts/abi/wallet.js";

const rpcUri = getRPC("Polygon");
export const provider = new ethers.providers.JsonRpcProvider(rpcUri);
export const signer = new ethers.Wallet(
  process.env.PRIVATE_KEY || "",
  provider
);

const entryPointContractAddress =
  process.env.ENTRY_POINT_CONTRACT_ADDRESS || "";
const walletContractAddress = process.env.WALLET_CONTRACT_ADDRESS || "";
const paymasterContractAddress = process.env.PAYMASTER_CONTRACT_ADDRESS || "";

export const entryPointContract = new ethers.Contract(
  entryPointContractAddress,
  entryPointContractAbi,
  provider
);
export const paymasterContract = new ethers.Contract(
  paymasterContractAddress,
  paymasterContractAbi,
  provider
);
export const walletContract = new ethers.Contract(
  walletContractAddress,
  walletContractAbi,
  provider
);
