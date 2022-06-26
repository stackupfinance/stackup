import { BigNumber, Contract, ContractTransaction } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import StakingDeployer from "./StakingDeployer";
import { Account, TxParams, BigNumberish, toAddress } from "../../types";

export default class Staking {
  instance: Contract;
  unlockDelay: BigNumberish;

  static async create(unlockDelay?: BigNumberish): Promise<Staking> {
    return StakingDeployer.deploy(unlockDelay);
  }

  constructor(instance: Contract, unlockDelay: BigNumberish) {
    this.instance = instance;
    this.unlockDelay = unlockDelay;
  }

  get address() {
    return this.instance.address;
  }

  async getDeposit(paymaster: Account): Promise<{
    amount: BigNumber;
    unstakeDelaySec: BigNumber;
    withdrawTime: BigNumber;
  }> {
    return this.instance.getDeposit(toAddress(paymaster));
  }

  async balanceOf(account: Account): Promise<BigNumber> {
    return this.instance.balanceOf(toAddress(account));
  }

  async hasDeposited(account: Account, amount: BigNumberish): Promise<boolean> {
    return this.instance.hasDeposited(toAddress(account), amount.toString());
  }

  async isStaked(account: Account): Promise<boolean> {
    return this.instance.isStaked(toAddress(account));
  }

  async isUnstaking(account: Account): Promise<boolean> {
    return this.instance.isUnstaking(toAddress(account));
  }

  async canWithdraw(account: Account): Promise<boolean> {
    return this.instance.canWithdraw(toAddress(account));
  }

  async deposit(
    to: Account,
    amount: BigNumber,
    params: TxParams = {}
  ): Promise<ContractTransaction> {
    return this.with(params).depositTo(toAddress(to), {
      value: amount.toString(),
    });
  }

  async stake(
    delay: BigNumberish,
    amount: BigNumberish,
    params: TxParams = {}
  ): Promise<ContractTransaction> {
    return this.with(params).addStake(delay, { value: amount.toString() });
  }

  async unstake(params: TxParams = {}): Promise<ContractTransaction> {
    return this.with(params).unlockStake();
  }

  async withdraw(
    recipient: Account,
    params: TxParams = {}
  ): Promise<ContractTransaction> {
    return this.with(params).withdrawStake(toAddress(recipient));
  }

  with(params: TxParams = {}): Contract {
    return params.from
      ? this.instance.connect(params.from as SignerWithAddress)
      : this.instance;
  }
}
