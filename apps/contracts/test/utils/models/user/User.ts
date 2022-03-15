import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { BigNumber, Contract, ContractTransaction } from 'ethers'

import EntryPoint from '../entry-point/EntryPoint'
import { bn } from '../../helpers/numbers'
import { getSigners } from '../../helpers/signers'
import { ZERO_ADDRESS } from '../../helpers/constants'
import { deploy, instanceAt } from '../../helpers/contracts'
import { assertIndirectEvent } from '../../helpers/asserts'
import { Account, toAddress } from '../../types'
import { UserOp, UserOpParams } from './types'
import { encodeCounterIncrement, encodeOwnerSignature, encodeWalletDeployment, encodeWalletExecute } from '../../helpers/encoding'

export default class User {
  static WALLET_CREATION_GAS = bn(690e3)
  static WALLET_VERIFICATION_GAS = bn(38500)
  static COUNTER_CALL_WITH_VALUE_GAS = bn(35000)
  static COUNTER_CALL_WITHOUT_VALUE_GAS = bn(28500)

  nextNonce: number
  wallet?: Contract
  entryPoint: EntryPoint
  signer: SignerWithAddress
  guardians: SignerWithAddress[]

  static async createWithWallet(entryPoint: EntryPoint, guardians = 3): Promise<User> {
    const user = await this.create(entryPoint, guardians)
    user.wallet = await user.createWallet()
    return user
  }

  static async create(entryPoint: EntryPoint, guardians = 3): Promise<User> {
    const signers = await getSigners(guardians + 1)
    return new this(entryPoint, signers[0], signers.slice(1, guardians + 1))
  }

  constructor(entryPoint: EntryPoint, signer: SignerWithAddress, guardians: SignerWithAddress[] = []) {
    this.nextNonce = 0
    this.signer = signer
    this.guardians = guardians
    this.entryPoint = entryPoint
  }

  get nonce(): number {
    return this.nextNonce - 1
  }

  get address(): string {
    return this.wallet?.address || ZERO_ADDRESS
  }

  async transfer(to: Account, value: BigNumber): Promise<ContractTransaction> {
    return this.signer.sendTransaction({ to: toAddress(to), value })
  }

  async sendOp(params?: UserOpParams): Promise<ContractTransaction> {
    const op = this.buildOp({ verificationGas: User.WALLET_VERIFICATION_GAS, ...params })
    if (op.sender === ZERO_ADDRESS) op.sender = await this.entryPoint.getSenderAddress(op)
    if (op.signature === '0x') op.signature = await this.signOp(op)
    return this.entryPoint.handleOps(op)
  }

  async signOp(op: UserOp): Promise<string> {
    const requestId = await this.entryPoint.getRequestId(op)
    const signature = await this.signer.signMessage(ethers.utils.arrayify(requestId))
    return encodeOwnerSignature({ signer: toAddress(this.signer), signature })
  }

  async getWalletDeploymentCode(implementation?: Contract): Promise<string> {
    return encodeWalletDeployment(this.entryPoint, this.signer, this.guardians, implementation)
  }

  async createWallet(): Promise<Contract> {
    const tx = await this.sendOp({
      initCode: await this.getWalletDeploymentCode(),
      preVerificationGas: User.WALLET_CREATION_GAS,
      callGas: User.COUNTER_CALL_WITHOUT_VALUE_GAS,
      callData: await encodeWalletExecute(await deploy('Counter'), await encodeCounterIncrement()),
    })

    const event = await assertIndirectEvent(tx, this.entryPoint.factory.interface, 'Deployed')
    return instanceAt('Wallet', event.args.createdContract)
  }

  buildOp(params?: UserOpParams): UserOp {
    return {
      sender: params?.sender ?? this.address,
      nonce: params?.nonce ?? this.nextNonce++,
      initCode: params?.initCode ?? '0x',
      callData: params?.callData ?? '0x',
      callGas: params?.callGas ?? bn(0),
      verificationGas: params?.verificationGas ?? bn(0),
      preVerificationGas: params?.preVerificationGas ?? bn(0),
      maxFeePerGas: params?.maxFeePerGas ?? bn(0),
      maxPriorityFeePerGas: params?.maxPriorityFeePerGas ?? bn(0),
      paymaster: params?.paymaster ?? ZERO_ADDRESS,
      paymasterData: params?.paymasterData ?? '0x',
      signature: params?.signature ?? '0x',
    }
  }
}
