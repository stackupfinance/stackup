import { ethers } from 'hardhat'
import { BigNumber, Contract, ContractTransaction } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

import { ZERO_BYTES32 } from '../../helpers/constants'
import { isBigNumberish } from '../../helpers/numbers'
import { encodeRequestId, encodeSignatures } from '../../helpers/encoding'

import WalletDeployer from './WalletDeployer'
import { UserOp, WalletDeployParams, Account, BigNumberish, TxParams, toAddress } from '../../types'

export default class Wallet {
  static OWNER_SIGNATURE = 0
  static GUARDIANS_SIGNATURE = 1

  instance: Contract
  implementation: Contract
  entryPoint: Contract
  owner: SignerWithAddress
  guardians: SignerWithAddress[]

  static async create(params: WalletDeployParams = {}): Promise<Wallet> {
    return WalletDeployer.deploy(params)
  }

  constructor(instance: Contract, implementation: Contract, entryPoint: Contract, owner: SignerWithAddress, guardians: SignerWithAddress[]) {
    this.instance = instance
    this.implementation = implementation
    this.entryPoint = entryPoint
    this.owner = owner
    this.guardians = guardians
  }

  get address(): string {
    return this.instance.address
  }

  async getCurrentImplementation(): Promise<string> {
    return this.instance.getCurrentImplementation()
  }

  async nonce(): Promise<BigNumber> {
    return this.instance.nonce()
  }

  async getRequestId(op: UserOp): Promise<string> {
    const network = await this.instance.provider!.getNetwork()
    return encodeRequestId(op, this.entryPoint, network.chainId)
  }

  async getOwnerCount(): Promise<BigNumber> {
    return this.instance.getOwnerCount()
  }

  async getGuardianCount(): Promise<BigNumber> {
    return this.instance.getGuardianCount()
  }

  async getOwner(index: number): Promise<string> {
    return this.instance.getOwner(index)
  }

  async getGuardian(index: number): Promise<string> {
    return this.instance.getGuardian(index)
  }

  async getRoleMemberCount(role: string): Promise<BigNumber> {
    return this.instance.getRoleMemberCount(role)
  }

  async getRoleAdmin(role: string): Promise<string> {
    return this.instance.getRoleAdmin(role)
  }

  async hasRole(role: string, account: Account): Promise<boolean> {
    return this.instance.hasRole(role, toAddress(account))
  }

  async isValidSignature(message: string, signature: string): Promise<string> {
    return this.instance.isValidSignature(message, signature)
  }

  async signWithOwner(op: UserOp, requestId: string): Promise<string> {
    const signature = await this.owner.signMessage(ethers.utils.arrayify(requestId))
    return encodeSignatures(Wallet.OWNER_SIGNATURE, { signer: this.owner.address, signature })
  }

  async signWithGuardians(op: UserOp, requestId: string): Promise<string> {
    return encodeSignatures(Wallet.GUARDIANS_SIGNATURE, await Promise.all(this.guardians.map(async guardian => {
      return { signer: guardian.address, signature: await guardian.signMessage(ethers.utils.arrayify(requestId)) }
    })))
  }

  async validatePaymasterUserOp(op: UserOp, maxCost: BigNumberish = 0): Promise<string> {
    return this.instance.validatePaymasterUserOp(op, maxCost)
  }

  async validateUserOp(op: UserOp, requestId = ZERO_BYTES32, prefundOrParams: BigNumberish | TxParams = 0, params: TxParams = {}): Promise<ContractTransaction> {
    const prefund = isBigNumberish(prefundOrParams) ? prefundOrParams.toString() : 0
    params = (isBigNumberish(prefundOrParams) ? params : prefundOrParams) as TxParams
    return this.with(params).validateUserOp(op, requestId, prefund)
  }

  async executeUserOp(to: Account, data = '0x', valueOrParams: BigNumberish | TxParams = 0, params: TxParams = {}): Promise<ContractTransaction> {
    const value = isBigNumberish(valueOrParams) ? valueOrParams.toString() : 0
    params = (isBigNumberish(valueOrParams) ? params : valueOrParams) as TxParams
    return this.with(params).executeUserOp(toAddress(to), value, data)
  }

  async postOp(context: string, actualGasCost: BigNumberish, modeOrParams: BigNumberish | TxParams = 0, params: TxParams = {}): Promise<ContractTransaction> {
    const mode = isBigNumberish(modeOrParams) ? modeOrParams.toString() : 0
    params = (isBigNumberish(modeOrParams) ? params : modeOrParams) as TxParams
    return this.with(params).postOp(mode, context, actualGasCost)
  }

  async transferOwner(to: Account, params: TxParams = {}): Promise<ContractTransaction> {
    return this.with(params).transferOwner(toAddress(to))
  }

  async grantGuardian(to: Account, params: TxParams = {}): Promise<ContractTransaction> {
    return this.with(params).grantGuardian(toAddress(to))
  }

  async revokeGuardian(to: Account, params: TxParams = {}): Promise<ContractTransaction> {
    return this.with(params).revokeGuardian(toAddress(to))
  }

  async upgradeTo(implementation: Contract, params: TxParams = {}): Promise<ContractTransaction> {
    return this.with(params).upgradeTo(toAddress(implementation))
  }

  with(params: TxParams = {}): Contract {
    if (params.from === this.entryPoint) return this.entryPoint
    return params.from ? this.instance.connect(params.from as SignerWithAddress) : this.instance
  }
}
