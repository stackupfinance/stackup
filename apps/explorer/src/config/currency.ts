export type CurrencySymbols = "USDC" | "ETH" | "MATIC";

type CurrencyMeta = {
  decimals: number;
};

export const ValidQuoteCurrenies: Array<CurrencySymbols> = ["USDC"];

export const ValidCurrencies: Array<CurrencySymbols> = ["USDC", "ETH", "MATIC"];

export const CurrencyMeta: Record<CurrencySymbols, CurrencyMeta> = {
  USDC: {
    decimals: 6,
  },
  ETH: {
    decimals: 18,
  },
  MATIC: {
    decimals: 18,
  },
};
