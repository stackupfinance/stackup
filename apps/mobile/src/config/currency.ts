import {ImageSourcePropType} from 'react-native';
import {UsdLogo, EthereumLogo, PolygonLogo} from '../components';

export type CurrencySymbols = 'USDC' | 'ETH' | 'MATIC';

type CurrencyMeta = {
  name: string;
  decimals: number;
  logo: ImageSourcePropType;
};

export const CurrencyList: Array<CurrencySymbols> = ['USDC'];

export const CurrencyMeta: Record<CurrencySymbols, CurrencyMeta> = {
  USDC: {
    name: 'USD',
    decimals: 6,
    logo: UsdLogo,
  },
  ETH: {
    name: 'Ethereum',
    decimals: 18,
    logo: EthereumLogo,
  },
  MATIC: {
    name: 'Matic',
    decimals: 18,
    logo: PolygonLogo,
  },
};
