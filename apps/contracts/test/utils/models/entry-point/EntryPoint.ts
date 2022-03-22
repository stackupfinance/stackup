import { ethers } from 'hardhat'
import { BigNumber, Contract, ContractTransaction } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'

import { bn } from '../../helpers/numbers'
import { ZERO_ADDRESS } from '../../helpers/constants'
import { encodeRequestId, encodeWalletValidateOp } from '../../helpers/encoding'

import EntryPointDeployer from './EntryPointDeployer'
import { UserOp } from '../user/types'
import { Account, NAry, TxParams, toArray, toBytes32, toAddress } from '../../types'

export default class EntryPoint {
  instance: Contract
  factory: Contract

  static async create(): Promise<EntryPoint> {
    return EntryPointDeployer.deploy()
  }

  constructor(instance: Contract, factory: Contract) {
    this.instance = instance
    this.factory = factory
  }

  get address() {
    return this.instance.address
  }

  async getRequestId(op: UserOp): Promise<string> {
    const network = await this.instance.provider!.getNetwork()
    return encodeRequestId(op, this, network.chainId)
  }

  async getSenderAddress(op: UserOp) {
    return this.instance.getSenderAddress(op.initCode, op.nonce);
  }

  async getGasPrice(op: UserOp): Promise<BigNumber> {
    return this.instance.getGasPrice(op)
  }

  async getRequiredPrefund(op: UserOp): Promise<BigNumber> {
    return this.instance.getRequiredPrefund(op)
  }

  async handleOps(ops: NAry<UserOp>, redeemer?: Account): Promise<ContractTransaction> {
    if (!redeemer) redeemer = ZERO_ADDRESS
    return this.instance.handleOps(toArray(ops), redeemer)
  }

  async estimatePrefund(op: UserOp): Promise<BigNumber> {
    const requestId = await this.getRequestId(op)
    const requiredPrefund = await this.getRequiredPrefund(op)
    const validationData = await encodeWalletValidateOp(op, requestId, requiredPrefund)
    const validationGas = (await ethers.provider.estimateGas({ to: ZERO_ADDRESS, data: validationData })).sub(21e3)
    const executionGas = (await ethers.provider.estimateGas({ to: ZERO_ADDRESS, data: op.callData })).sub(21e3)
    const creationGas = op.initCode !== '0x'
      ? (await this.factory.estimateGas.deploy(op.initCode, toBytes32(op.nonce))).sub(21e3)
      : bn(0)

    const totalGas = creationGas.add(validationGas).add(executionGas)
    const gasPrice = await this.getGasPrice(op)
    return totalGas.mul(gasPrice)
  }

  async getStake(paymaster: Account): Promise<{ value: BigNumber, lockExpiryTime: BigNumber, isLocked: boolean }> {
    return this.instance.getStake(toAddress(paymaster))
  }

  async stake(amount: BigNumber, params: TxParams = {}): Promise<ContractTransaction> {
    return this.with(params).addStake({ value: amount.toString() })
  }

  async stakeAndLock(amount: BigNumber, params: TxParams = {}): Promise<ContractTransaction> {
    await this.stake(amount, params)
    return this.with(params).lockStake()
  }

  async unlockStake(params: TxParams = {}): Promise<ContractTransaction> {
    return this.with(params).unlockStake()
  }

  async unstake(recipient: Account, params: TxParams = {}): Promise<ContractTransaction> {
    return this.with(params).withdrawStake(toAddress(recipient))
  }

  with(params: TxParams = {}): Contract {
    return params.from ? this.instance.connect(params.from as SignerWithAddress) : this.instance
  }
}
