import { ethers } from "hardhat";
import { BigNumber, Contract, ContractTransaction } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { ZERO_BYTES32 } from "../../helpers/constants";
import { isBigNumberish } from "../../helpers/numbers";
import {
  encodePaymasterRequest,
  encodeSignatures,
} from "../../helpers/encoding";

import PaymasterDeployer from "./PaymasterDeployer";
import {
  UserOp,
  PaymasterDeployParams,
  Account,
  BigNumberish,
  TxParams,
  PaymasterData,
  toAddress,
} from "../../types";

export default class Paymaster {
  static OWNER_SIGNATURE = 0;
  static GUARDIANS_SIGNATURE = 1;

  instance: Contract;
  implementation: Contract;
  entryPoint: Contract;
  owner: SignerWithAddress;
  guardians: SignerWithAddress[];

  static async create(params: PaymasterDeployParams = {}): Promise<Paymaster> {
    return PaymasterDeployer.deploy(params);
  }

  constructor(
    instance: Contract,
    implementation: Contract,
    entryPoint: Contract,
    owner: SignerWithAddress,
    guardians: SignerWithAddress[]
  ) {
    this.instance = instance;
    this.implementation = implementation;
    this.entryPoint = entryPoint;
    this.owner = owner;
    this.guardians = guardians;
  }

  get address(): string {
    return this.instance.address;
  }

  async getCurrentImplementation(): Promise<string> {
    return this.instance.getCurrentImplementation();
  }

  async getOwnersCount(): Promise<BigNumber> {
    return this.instance.getOwnersCount();
  }

  async getGuardiansCount(): Promise<BigNumber> {
    return this.instance.getGuardiansCount();
  }

  async getOwner(index: number): Promise<string> {
    return this.instance.getOwner(index);
  }

  async getGuardian(index: number): Promise<string> {
    return this.instance.getGuardian(index);
  }

  async getMinGuardiansSignatures(): Promise<BigNumber> {
    return this.instance.getMinGuardiansSignatures();
  }

  async getRoleMemberCount(role: string): Promise<BigNumber> {
    return this.instance.getRoleMemberCount(role);
  }

  async getRoleAdmin(role: string): Promise<string> {
    return this.instance.getRoleAdmin(role);
  }

  async hasRole(role: string, account: Account): Promise<boolean> {
    return this.instance.hasRole(role, toAddress(account));
  }

  async isValidSignature(message: string, signature: string): Promise<string> {
    return this.instance.isValidSignature(message, signature);
  }

  async signPaymasterRequestWithOwner(
    op: UserOp,
    paymasterData: PaymasterData,
    signer?: SignerWithAddress
  ): Promise<string> {
    const paymasterRequest = encodePaymasterRequest(op, paymasterData);
    return await this.signWithOwner(paymasterRequest, signer);
  }

  async signPaymasterRequestWithGuardians(
    op: UserOp,
    paymasterData: PaymasterData
  ): Promise<string> {
    const paymasterRequest = encodePaymasterRequest(op, paymasterData);
    return await this.signWithGuardians(paymasterRequest);
  }

  async signWithOwner(
    data: string,
    signer?: SignerWithAddress
  ): Promise<string> {
    const signature = await (signer ?? this.owner).signMessage(
      ethers.utils.arrayify(data)
    );
    return encodeSignatures(Paymaster.OWNER_SIGNATURE, {
      signer: (signer ?? this.owner).address,
      signature,
    });
  }

  async signWithGuardians(data: string): Promise<string> {
    return encodeSignatures(
      Paymaster.GUARDIANS_SIGNATURE,
      await Promise.all(
        this.guardians.map(async (guardian) => {
          return {
            signer: guardian.address,
            signature: await guardian.signMessage(ethers.utils.arrayify(data)),
          };
        })
      )
    );
  }

  async validatePaymasterUserOp(
    op: UserOp,
    maxCost: BigNumberish = 0
  ): Promise<string> {
    return this.instance.validatePaymasterUserOp(op, ZERO_BYTES32, maxCost);
  }

  async postOp(
    context: string,
    actualGasCost: BigNumberish,
    modeOrParams: BigNumberish | TxParams = 0,
    params: TxParams = {}
  ): Promise<ContractTransaction> {
    const mode = isBigNumberish(modeOrParams) ? modeOrParams.toString() : 0;
    params = (isBigNumberish(modeOrParams) ? params : modeOrParams) as TxParams;
    return this.with(params).postOp(mode, context, actualGasCost);
  }

  async transferOwner(
    to: Account,
    params: TxParams = {}
  ): Promise<ContractTransaction> {
    return this.with(params).transferOwner(toAddress(to));
  }

  async grantGuardian(
    to: Account,
    params: TxParams = {}
  ): Promise<ContractTransaction> {
    return this.with(params).grantGuardian(toAddress(to));
  }

  async revokeGuardian(
    to: Account,
    params: TxParams = {}
  ): Promise<ContractTransaction> {
    return this.with(params).revokeGuardian(toAddress(to));
  }

  async upgradeTo(
    implementation: Contract,
    params: TxParams = {}
  ): Promise<ContractTransaction> {
    return this.with(params).upgradeTo(toAddress(implementation));
  }

  with(params: TxParams = {}): Contract {
    if (params.from === this.entryPoint) return this.entryPoint;
    return params.from
      ? this.instance.connect(params.from as SignerWithAddress)
      : this.instance;
  }
}
