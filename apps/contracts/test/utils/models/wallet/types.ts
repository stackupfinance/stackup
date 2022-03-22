import { Contract } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'

export type WalletDeployParams = {
  owner?: SignerWithAddress
  guardians?: SignerWithAddress[]
  entryPoint?: Contract
}
