import { ethers } from "ethers";
import * as SingletonFactory from "./singletonFactory";
import * as EntryPoint from "./entryPoint";
import source from "./source/Wallet.json";

const _deployInitCode = new ethers.ContractFactory(
  source.abi,
  source.bytecode
).getDeployTransaction(EntryPoint.address).data;
if (!_deployInitCode) {
  throw new Error("_deployInitCode not initialized");
}

const _deploySalt = ethers.utils.formatBytes32String(String.fromCharCode(0));

const _address = ethers.utils.getCreate2Address(
  SingletonFactory.address,
  _deploySalt,
  ethers.utils.keccak256(_deployInitCode)
);

export const deploySalt = _deploySalt;

export const deployInitCode = _deployInitCode;

export const address = _address;

// @ts-ignore
export const interface = new ethers.utils.Interface(source.abi);

export const getInstance = (provider: ethers.providers.Provider) =>
  new ethers.Contract(_address, source.abi, provider);
