import { ethers } from "hardhat";
import { BigNumber, Contract, ContractTransaction } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import { bn } from "../../helpers/numbers";
import { getSigner } from "../../helpers/signers";
import { ZERO_ADDRESS } from "../../helpers/constants";
import {
  encodeRequestId,
  encodeWalletValidateOp,
} from "../../helpers/encoding";

import Staking from "../staking/Staking";
import EntryPointDeployer from "./EntryPointDeployer";
import {
  Account,
  NAry,
  TxParams,
  UserOp,
  BigNumberish,
  toArray,
  toBytes32,
} from "../../types";

export default class EntryPoint extends Staking {
  factory: Contract;

  static async create(unlockDelay?: BigNumberish): Promise<EntryPoint> {
    return EntryPointDeployer.deploy(unlockDelay);
  }

  constructor(
    instance: Contract,
    factory: Contract,
    unlockDelay: BigNumberish
  ) {
    super(instance, unlockDelay);
    this.factory = factory;
  }

  async getRequestId(op: UserOp): Promise<string> {
    const network = await this.instance.provider!.getNetwork();
    return encodeRequestId(op, this, network.chainId);
  }

  async getSenderAddress(op: UserOp) {
    return this.instance.getSenderAddress(op.initCode, op.nonce);
  }

  async getGasPrice(op: UserOp): Promise<BigNumber> {
    return this.instance.getGasPrice(op);
  }

  async getRequiredPrefund(op: UserOp): Promise<BigNumber> {
    return this.instance.getRequiredPrefund(op);
  }

  async simulateValidation(
    op: UserOp
  ): Promise<{ preOpGas: BigNumber; prefund: BigNumber }> {
    return this.instance
      .connect(await getSigner(ZERO_ADDRESS))
      .callStatic.simulateValidation(op);
  }

  async handleOps(
    ops: NAry<UserOp>,
    redeemer?: Account
  ): Promise<ContractTransaction> {
    if (!redeemer) redeemer = ZERO_ADDRESS;
    return this.instance.handleOps(toArray(ops), redeemer);
  }

  async estimatePrefund(op: UserOp): Promise<BigNumber> {
    const requestId = await this.getRequestId(op);
    const requiredPrefund = await this.getRequiredPrefund(op);
    const validationData = await encodeWalletValidateOp(
      op,
      requestId,
      requiredPrefund
    );
    const validationGas = (
      await ethers.provider.estimateGas({
        to: ZERO_ADDRESS,
        data: validationData,
      })
    ).sub(21e3);
    const executionGas = (
      await ethers.provider.estimateGas({ to: ZERO_ADDRESS, data: op.callData })
    ).sub(21e3);
    const creationGas =
      op.initCode !== "0x"
        ? (
            await this.factory.estimateGas.deploy(
              op.initCode,
              toBytes32(op.nonce)
            )
          ).sub(21e3)
        : bn(0);

    const totalGas = creationGas.add(validationGas).add(executionGas);
    const gasPrice = await this.getGasPrice(op);
    return totalGas.mul(gasPrice);
  }

  with(params: TxParams = {}): Contract {
    return params.from
      ? this.instance.connect(params.from as SignerWithAddress)
      : this.instance;
  }
}
