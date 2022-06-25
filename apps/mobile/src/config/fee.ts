import {BigNumberish} from 'ethers';
import {CurrencySymbols} from './currency';

export type Fee = {
  value: BigNumberish;
  currency: CurrencySymbols;
};
