import { Networks, CurrencySymbols } from ".";

type CheckBlock = {
  network: Networks;
  attempt: number;
};

type ParseBlock = {
  network: Networks;
  blockNumber: number;
  attempt: number;
};

type FetchQuotes = {
  quoteCurrency: CurrencySymbols;
  attempt: number;
};

export type Jobs = {
  checkBlock: CheckBlock;
  parseBlock: ParseBlock;
  fetchQuotes: FetchQuotes;
};
