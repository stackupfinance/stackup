import { BigNumber, Contract, ContractTransaction } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { ZERO_BYTES32 } from "../../helpers/constants";
import { isBigNumberish } from "../../helpers/numbers";
import { encodeRequestId } from "../../helpers/encoding";

import Paymaster from "../paymaster/Paymaster";
import WalletDeployer from "./WalletDeployer";
import {
  UserOp,
  WalletDeployParams,
  Account,
  BigNumberish,
  TxParams,
  toAddress,
} from "../../types";

export default class Wallet extends Paymaster {
  static async create(params: WalletDeployParams = {}): Promise<Wallet> {
    return WalletDeployer.deploy(params);
  }

  constructor(
    instance: Contract,
    implementation: Contract,
    entryPoint: Contract,
    owner: SignerWithAddress,
    guardians: SignerWithAddress[]
  ) {
    super(instance, implementation, entryPoint, owner, guardians);
  }

  async nonce(): Promise<BigNumber> {
    return this.instance.nonce();
  }

  async getRequestId(op: UserOp): Promise<string> {
    const network = await this.instance.provider!.getNetwork();
    return encodeRequestId(op, this.entryPoint, network.chainId);
  }

  async signRequestIdWithOwner(
    op: UserOp,
    signer?: SignerWithAddress
  ): Promise<string> {
    const requestId = await this.getRequestId(op);
    return this.signWithOwner(requestId, signer);
  }

  async signRequestIdWithGuardians(op: UserOp): Promise<string> {
    const requestId = await this.getRequestId(op);
    return this.signWithGuardians(requestId);
  }

  async validateUserOp(
    op: UserOp,
    requestId = ZERO_BYTES32,
    prefundOrParams: BigNumberish | TxParams = 0,
    params: TxParams = {}
  ): Promise<ContractTransaction> {
    const prefund = isBigNumberish(prefundOrParams)
      ? prefundOrParams.toString()
      : 0;
    params = (
      isBigNumberish(prefundOrParams) ? params : prefundOrParams
    ) as TxParams;
    return this.with(params).validateUserOp(op, requestId, prefund);
  }

  async executeUserOp(
    to: Account,
    data = "0x",
    valueOrParams: BigNumberish | TxParams = 0,
    params: TxParams = {}
  ): Promise<ContractTransaction> {
    const value = isBigNumberish(valueOrParams) ? valueOrParams.toString() : 0;
    params = (
      isBigNumberish(valueOrParams) ? params : valueOrParams
    ) as TxParams;
    return this.with(params).executeUserOp(toAddress(to), value, data);
  }
}
