import { CurrencySymbols } from ".";

type FetchQuotes = {
  quoteCurrency: CurrencySymbols;
  attempt: number;
};

export type Jobs = {
  fetchQuotes: FetchQuotes;
};
