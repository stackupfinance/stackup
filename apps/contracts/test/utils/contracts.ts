import path from 'path'
import { ethers } from 'hardhat'
import { Contract } from 'ethers'
import { Artifact } from 'hardhat/types'
import { Interface } from 'ethers/lib/utils'
import { Artifacts } from 'hardhat/internal/artifacts'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'

import { getSigner } from './signers'

export async function deploy(
  nameOrArtifact: string | { abi: any; bytecode: string },
  args: Array<any> = [],
  from?: SignerWithAddress
): Promise<Contract> {
  if (!args) args = []
  if (!from) from = await getSigner()

  const artifact = typeof nameOrArtifact === 'string' ? await getArtifact(nameOrArtifact) : nameOrArtifact
  const factory = await ethers.getContractFactory(artifact.abi, artifact.bytecode)
  const instance = await factory.connect(from).deploy(...args)
  return instance.deployed()
}

export async function instanceAt(nameOrArtifact: string | any, address: string): Promise<Contract> {
  const artifact = typeof nameOrArtifact === 'string' ? await getArtifact(nameOrArtifact) : nameOrArtifact
  return ethers.getContractAt(artifact.abi, address)
}

export async function getInterface(contractName: string): Promise<Interface> {
  const artifact = await getArtifact(contractName)
  return new ethers.utils.Interface(artifact.abi)
}

export async function getArtifact(contractName: string): Promise<Artifact> {
  const artifactsPath = !contractName.includes('/')
    ? path.resolve('./artifacts')
    : path.dirname(require.resolve(`${contractName}.json`))
  const artifacts = new Artifacts(artifactsPath)
  return artifacts.readArtifact(contractName.split('/').slice(-1)[0])
}
