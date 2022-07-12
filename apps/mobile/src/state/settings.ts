import create from 'zustand';
import {persist, devtools} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Networks, CurrencySymbols, TimePeriod} from '../config';

interface SettingsStateConstants {
  loading: boolean;
  network: Networks;
  quoteCurrency: CurrencySymbols;
  currencies: Array<CurrencySymbols>;
  timePeriod: TimePeriod;
}

interface SettingsState extends SettingsStateConstants {
  toggleCurrency: (currency: CurrencySymbols, enabled: boolean) => void;
  clear: () => void;

  hasHydrated: boolean;
  setHasHydrated: (flag: boolean) => void;
}

const defaults: SettingsStateConstants = {
  loading: false,
  network: 'Polygon',
  quoteCurrency: 'USDC',
  currencies: ['USDC'],
  timePeriod: 'Month',
};
const STORE_NAME = 'stackup-settings-store';
const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      (set, get) => ({
        ...defaults,

        toggleCurrency: (currency, enabled) => {
          const currencies = enabled
            ? [...new Set([...get().currencies, currency])]
            : [...get().currencies].filter(curr => curr !== currency);
          set({currencies});
        },

        clear: () => {
          set({...defaults});
        },

        hasHydrated: false,
        setHasHydrated: flag => {
          set({hasHydrated: flag});
        },
      }),
      {
        name: STORE_NAME,
        getStorage: () => AsyncStorage,
        partialize: state => {
          const {loading, hasHydrated, ...persisted} = state;
          return persisted;
        },
        onRehydrateStorage: () => state => {
          state?.setHasHydrated(true);
        },
      },
    ),
    {name: STORE_NAME},
  ),
);

export const useSettingsStoreRemoveWalletSelector = () =>
  useSettingsStore(state => ({clear: state.clear}));

export const useSettingsStoreAssetsSheetsSelector = () =>
  useSettingsStore(state => ({
    currencies: state.currencies,
    timePeriod: state.timePeriod,
    network: state.network,
    quoteCurrency: state.quoteCurrency,
    toggleCurrency: state.toggleCurrency,
  }));

export const useSettingsStoreAssetsSelector = () =>
  useSettingsStore(state => ({
    network: state.network,
    quoteCurrency: state.quoteCurrency,
    currencies: state.currencies,
    timePeriod: state.timePeriod,
  }));

export const useSettingsStoreSwapSelector = () =>
  useSettingsStore(state => ({
    network: state.network,
    quoteCurrency: state.quoteCurrency,
  }));

export const useSettingsStoreSwapSheetsSelector = () =>
  useSettingsStore(state => ({
    network: state.network,
    quoteCurrency: state.quoteCurrency,
    timePeriod: state.timePeriod,
  }));
