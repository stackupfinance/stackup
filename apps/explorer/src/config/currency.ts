export type CurrencySymbols =
  | "USDC"
  | "ETH"
  | "MATIC"
  | "BTC"
  | "UNI"
  | "AAVE"
  | "CRV"
  | "LDO"
  | "LINK"
  | "MKR"
  | "DAI"
  | "SUSHI"
  | "YFI"
  | "DPI"
  | "MVI";

type CurrencyMeta = {
  decimals: number;
};

export const ValidQuoteCurrenies: Array<CurrencySymbols> = ["USDC"];

export const ValidCurrencies: Array<CurrencySymbols> = [
  "USDC",
  "ETH",
  "MATIC",
  "BTC",
  "UNI",
  "AAVE",
  "CRV",
  "LDO",
  "LINK",
  "MKR",
  "DAI",
  "SUSHI",
  "YFI",
  "DPI",
  "MVI",
];

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
  BTC: {
    decimals: 8,
  },
  UNI: {
    decimals: 18,
  },
  AAVE: {
    decimals: 18,
  },
  CRV: {
    decimals: 18,
  },
  LDO: {
    decimals: 18,
  },
  LINK: {
    decimals: 18,
  },
  MKR: {
    decimals: 18,
  },
  DAI: {
    decimals: 18,
  },
  SUSHI: {
    decimals: 18,
  },
  YFI: {
    decimals: 18,
  },
  DPI: {
    decimals: 18,
  },
  MVI: {
    decimals: 18,
  },
};
