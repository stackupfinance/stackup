import {CurrencyBalances} from './currency';

export interface PaymasterStatus {
  address: string;
  fees: CurrencyBalances;
  allowances: CurrencyBalances;
}
