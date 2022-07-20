import {ImageSourcePropType} from 'react-native';
import {BigNumberish} from 'ethers';
import {UsdLogo, EthereumLogo, PolygonLogo, BitcoinLogo} from '../components';

export type CurrencySymbols = 'USDC' | 'ETH' | 'MATIC' | 'BTC';

export type CurrencyBalances = Partial<Record<CurrencySymbols, BigNumberish>>;

type CurrencyMeta = {
  name: string;
  displaySymbol: string;
  decimals: number;
  logo: ImageSourcePropType;
};

export const CurrencyList: Array<CurrencySymbols> = [
  'USDC',
  'ETH',
  'MATIC',
  'BTC',
];

export const CurrencyMeta: Record<CurrencySymbols, CurrencyMeta> = {
  USDC: {
    name: 'USD',
    displaySymbol: 'USD',
    decimals: 6,
    logo: UsdLogo,
  },
  ETH: {
    name: 'Ethereum',
    displaySymbol: 'ETH',
    decimals: 18,
    logo: EthereumLogo,
  },
  MATIC: {
    name: 'Matic',
    displaySymbol: 'MATIC',
    decimals: 18,
    logo: PolygonLogo,
  },
  BTC: {
    name: 'Bitcoin',
    displaySymbol: 'BTC',
    decimals: 8,
    logo: BitcoinLogo,
  },
};
