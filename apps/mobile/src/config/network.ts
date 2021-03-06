import {ImageSourcePropType} from 'react-native';
import {BigNumberish, ethers} from 'ethers';
import {Env} from './env';
import {CurrencySymbols} from './currency';
import {PolygonLogo} from '../components';

export type Networks = 'Polygon';

type NetworksConfig = {
  name: string;
  color: string;
  logo: ImageSourcePropType;
  nativeCurrency: CurrencySymbols;
  chainId: BigNumberish;
  currencies: Record<CurrencySymbols, {address: string}>;
};

export const NetworksConfig: Record<Networks, NetworksConfig> = {
  Polygon: {
    name: 'Polygon',
    color: '#6561ff',
    logo: PolygonLogo,
    nativeCurrency: 'MATIC',
    chainId: Env.NETWORK_ENV === 'mainnet' ? '137' : '80001',
    currencies: {
      MATIC: {address: ethers.constants.AddressZero},
      USDC: {
        address:
          Env.NETWORK_ENV === 'mainnet'
            ? '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
            : '0x2058A9D7613eEE744279e3856Ef0eAda5FCbaA7e',
      },
      ETH: {
        address:
          Env.NETWORK_ENV === 'mainnet'
            ? '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619'
            : '0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa',
      },
      BTC: {
        address:
          Env.NETWORK_ENV === 'mainnet'
            ? '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6'
            : '0x0d787a4a1548f673ed375445535a6c7A1EE56180',
      },
    },
  },
};
