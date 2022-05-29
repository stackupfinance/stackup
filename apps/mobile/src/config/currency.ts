export type CurrencySymbols = 'USDC' | 'ETH' | 'MATIC';

type CurrencyMeta = {
  name: string;
  decimals: number;
};

export const CurrencyMeta: Record<CurrencySymbols, CurrencyMeta> = {
  USDC: {
    name: 'USD',
    decimals: 6,
  },
  ETH: {
    name: 'Ethereum',
    decimals: 18,
  },
  MATIC: {
    name: 'Matic',
    decimals: 18,
  },
};
