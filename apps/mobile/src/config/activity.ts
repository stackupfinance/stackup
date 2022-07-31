import {BigNumberish} from 'ethers';
import {CurrencySymbols} from './currency';

export type ActivityType = 'INCOMING_CURRENCY' | 'OUTGOING_CURRENCY';

export interface ActivityItem {
  transactionHash: string;
  from: string;
  to: string;
  value: BigNumberish;
  currency: CurrencySymbols;
  timestamp: number;
  type: ActivityType;
}
