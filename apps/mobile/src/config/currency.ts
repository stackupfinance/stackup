import {ImageSourcePropType} from 'react-native';
import {BigNumberish} from 'ethers';
import {
  UsdLogo,
  EthereumLogo,
  PolygonLogo,
  BitcoinLogo,
  UNIlogo,
  AAVElogo,
  CRVlogo,
  LDOlogo,
  LINKlogo,
  MKRlogo,
  DAIlogo,
  SUSHIlogo,
  YFIlogo,
  DPIlogo,
  MVIlogo,
} from '../components';

export type CurrencySymbols =
  | 'USDC'
  | 'ETH'
  | 'MATIC'
  | 'BTC'
  | 'UNI'
  | 'AAVE'
  | 'CRV'
  | 'LDO'
  | 'LINK'
  | 'MKR'
  | 'DAI'
  | 'SUSHI'
  | 'YFI'
  | 'DPI'
  | 'MVI';

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
  'UNI',
  'AAVE',
  'CRV',
  'LDO',
  'LINK',
  'MKR',
  'DAI',
  'SUSHI',
  'YFI',
  'DPI',
  'MVI',
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
  UNI: {
    name: 'Uniswap',
    displaySymbol: 'UNI',
    decimals: 18,
    logo: UNIlogo,
  },
  AAVE: {
    name: 'Aave',
    displaySymbol: 'AAVE',
    decimals: 18,
    logo: AAVElogo,
  },
  CRV: {
    name: 'Curve',
    displaySymbol: 'CRV',
    decimals: 18,
    logo: CRVlogo,
  },
  LDO: {
    name: 'Lido Finance',
    displaySymbol: 'LDO',
    decimals: 18,
    logo: LDOlogo,
  },
  LINK: {
    name: 'Chainlink',
    displaySymbol: 'LINK',
    decimals: 18,
    logo: LINKlogo,
  },
  MKR: {
    name: 'Maker DAO',
    displaySymbol: 'MKR',
    decimals: 18,
    logo: MKRlogo,
  },
  DAI: {
    name: 'Dai',
    displaySymbol: 'DAI',
    decimals: 18,
    logo: DAIlogo,
  },
  SUSHI: {
    name: 'Sushiswap',
    displaySymbol: 'SUSHI',
    decimals: 18,
    logo: SUSHIlogo,
  },
  YFI: {
    name: 'Yearn Finance',
    displaySymbol: 'YFI',
    decimals: 18,
    logo: YFIlogo,
  },
  DPI: {
    name: 'DeFi Pulse Index',
    displaySymbol: 'DPI',
    decimals: 18,
    logo: DPIlogo,
  },
  MVI: {
    name: 'Metaverse Index',
    displaySymbol: 'MVI',
    decimals: 18,
    logo: MVIlogo,
  },
};
