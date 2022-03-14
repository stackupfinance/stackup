import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { BigNumber, Contract, ContractTransaction } from 'ethers'

import EntryPoint from '../entry-point/EntryPoint'
import { bn } from '../../helpers/numbers'
import { getSigners } from '../../helpers/signers'
import { ZERO_ADDRESS } from '../../helpers/constants'
import { encodeOwnerSignature, encodeWalletDeployment } from '../../helpers/encoding'

import { UserOp, UserOpParams } from './types'
import { Account, toAddress } from '../../types'

export default class User {
  nextNonce: number
  signer: SignerWithAddress
  guardians: SignerWithAddress[]

  static async create(guardians = 3) {
    const signers = await getSigners(guardians + 1)
    return new this(signers[0], signers.slice(1, guardians + 1))
  }

  constructor(signer: SignerWithAddress, guardians: SignerWithAddress[] = []) {
    this.nextNonce = 0
    this.signer = signer
    this.guardians = guardians
  }

  get address(): string {
    return this.signer.address
  }

  get nonce(): number {
    return this.nextNonce - 1
  }

  async transfer(to: Account, value: BigNumber): Promise<ContractTransaction> {
    return this.signer.sendTransaction({ to: toAddress(to), value })
  }

  async signOp(op: UserOp, entryPoint: EntryPoint): Promise<string> {
    const requestId = await entryPoint.getRequestId(op)
    const signature = await this.signer.signMessage(ethers.utils.arrayify(requestId))
    return encodeOwnerSignature({ signer: this.address, signature })
  }

  async getWalletDeploymentCode(entryPoint: Account, implementation?: Contract): Promise<string> {
    return encodeWalletDeployment(entryPoint, this, this.guardians, implementation)
  }

  buildOp(params?: UserOpParams): UserOp {
    return {
      sender: params?.sender ?? ZERO_ADDRESS,
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
