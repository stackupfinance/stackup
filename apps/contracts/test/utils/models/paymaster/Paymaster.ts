import { ethers } from 'hardhat'
import { BigNumber, Contract, ContractTransaction } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'

import { bn } from '../../helpers/numbers'
import { getSigner } from '../../helpers/signers'
import {
  encodeEntryPointLock,
  encodeEntryPointStake,
  encodeEntryPointUnlock,
  encodeEntryPointWithdraw,
  encodePaymasterData,
  encodePaymasterSignature,
  encodeWalletExecute
} from '../../helpers/encoding'

import User from '../user/User'
import EntryPoint from '../entry-point/EntryPoint'
import { UserOp } from '../user/types'

export default class Paymaster extends User {
  static LOCK_CALL_GAS = bn(100e3)
  static STAKE_CALL_GAS = bn(100e6)
  static UNLOCK_CALL_GAS = bn(100e3)
  static WITHDRAW_CALL_GAS = bn(100e3)
  static LOCK_EXPIRY_PERIOD = 172800 // 2 days

  static async createWithWallet(entryPoint: EntryPoint, offset = 6): Promise<Paymaster> {
    const signer = await getSigner(offset)
    const paymaster = new this(entryPoint, signer)
    paymaster.wallet = await paymaster.createWallet()
    return paymaster
  }

  constructor(entryPoint: EntryPoint, signer: SignerWithAddress) {
    super(entryPoint, signer)
  }

  async signPaymasterData(op: UserOp, fee: BigNumber, token: Contract, feed: Contract): Promise<string> {
    const data = encodePaymasterData(op, fee, token, feed)
    const signature = await this.signer.signMessage(ethers.utils.arrayify((data)))
    return encodePaymasterSignature(fee, token, feed, signature)
  }

  async stake(amount: BigNumber): Promise<ContractTransaction> {
    return this.sendOp({
      callGas: Paymaster.STAKE_CALL_GAS,
      callData: await encodeWalletExecute(this.entryPoint, await encodeEntryPointStake(), amount),
    })
  }

  async lock(): Promise<ContractTransaction> {
    return this.sendOp({
      callGas: Paymaster.LOCK_CALL_GAS,
      callData: await encodeWalletExecute(this.entryPoint, await encodeEntryPointLock()),
    })
  }

  async unlock(): Promise<ContractTransaction> {
    return this.sendOp({
      callGas: Paymaster.UNLOCK_CALL_GAS,
      callData: await encodeWalletExecute(this.entryPoint, await encodeEntryPointUnlock()),
    })
  }

  async withdraw(amount: BigNumber): Promise<ContractTransaction> {
    return this.sendOp({
      callGas: Paymaster.WITHDRAW_CALL_GAS,
      callData: await encodeWalletExecute(this.entryPoint, await encodeEntryPointWithdraw(amount)),
    })
  }
}
