import path from "path";
import { ethers } from "hardhat";
import { Artifact } from "hardhat/types";
import { Interface } from "ethers/lib/utils";
import { Artifacts } from "hardhat/internal/artifacts";
import { Contract, ContractFactory } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import { getSigner } from "./signers";

export async function deploy(
  name: string,
  args: Array<any> = [],
  from?: SignerWithAddress
): Promise<Contract> {
  if (!args) args = [];
  if (!from) from = await getSigner();
  const factory = await getFactory(name);
  const instance = await factory.connect(from).deploy(...args);
  return instance.deployed();
}

export async function instanceAt(
  name: string,
  address: string
): Promise<Contract> {
  const artifact = await getArtifact(name);
  return ethers.getContractAt(artifact.abi, address);
}

export async function getInterface(name: string): Promise<Interface> {
  const artifact = await getArtifact(name);
  return new ethers.utils.Interface(artifact.abi);
}

export async function getFactory(name: string): Promise<ContractFactory> {
  const artifact = await getArtifact(name);
  return ethers.getContractFactory(artifact.abi, artifact.bytecode);
}

export async function getArtifact(name: string): Promise<Artifact> {
  const artifactsPath = !name.includes("/")
    ? path.resolve("./artifacts")
    : path.dirname(require.resolve(`${name}.json`));
  const artifacts = new Artifacts(artifactsPath);
  return artifacts.readArtifact(name.split("/").slice(-1)[0]);
}
