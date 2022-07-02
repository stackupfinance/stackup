import {BigNumberish} from 'ethers';

export interface GasEstimate {
  maxPriorityFeePerGas: BigNumberish;
  maxFeePerGas: BigNumberish;
}
