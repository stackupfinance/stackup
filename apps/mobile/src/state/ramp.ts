import {Platform} from 'react-native';
import create from 'zustand';
import {devtools} from 'zustand/middleware';
import RampSdk from '@ramp-network/react-native-sdk';
import {Env} from '../config';

interface RampState {
  debounceAndroidAppState: boolean;

  setDebounceAndroidAppState: (value: boolean) => void;
  openRamp: (walletAddress: string) => void;

  clear: () => void;
}

const STORE_NAME = 'stackup-ramp-store';
const useRampStore = create<RampState>()(
  devtools(
    set => ({
      debounceAndroidAppState: false,

      setDebounceAndroidAppState: debounceAndroidAppState => {
        if (Platform.OS === 'android') {
          set({debounceAndroidAppState});
        }
      },

      openRamp: walletAddress => {
        const ramp = new RampSdk({
          hostApiKey:
            Env.NETWORK_ENV === 'mainnet' ? Env.RAMP_HOST_API_KEY : undefined,
          url:
            Env.NETWORK_ENV === 'mainnet'
              ? undefined
              : 'https://ri-widget-staging.firebaseapp.com',
          hostAppName: 'Stackup',
          hostLogoUrl: 'https://i.imgur.com/y4O1zwO.png',
          swapAsset: 'MATIC_USDC',
          fiatCurrency: 'USD',
          fiatValue: '100',
          userAddress: walletAddress,
        });

        set({debounceAndroidAppState: true});
        return ramp.show();
      },

      clear: () => {
        set({debounceAndroidAppState: false});
      },
    }),
    {name: STORE_NAME},
  ),
);

export const useRampStoreRemoveWalletSelector = () =>
  useRampStore(state => ({clear: state.clear}));

export const useRampStoreAuthSelector = () =>
  useRampStore(state => ({
    debounceAndroidAppState: state.debounceAndroidAppState,
    setDebounceAndroidAppState: state.setDebounceAndroidAppState,
  }));

export const useRampStoreHomeSelector = () =>
  useRampStore(state => ({openRamp: state.openRamp}));
