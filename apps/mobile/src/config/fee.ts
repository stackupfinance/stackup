import {BigNumberish} from 'ethers';
import {CurrencySymbols} from './currency';

export type Fee = {
  currency: CurrencySymbols;
  value: BigNumberish;
};
