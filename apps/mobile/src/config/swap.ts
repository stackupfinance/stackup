import {BigNumberish, BytesLike} from 'ethers';

export interface OptimalQuote {
  amount: BigNumberish;
  rate: BigNumberish;
  transaction: {
    to: string;
    data: BytesLike;
    value: BigNumberish;
    gas: BigNumberish;
    gasPrice: BigNumberish;
  };
}
