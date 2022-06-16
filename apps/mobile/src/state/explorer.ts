import create from 'zustand';
import {persist, devtools} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BigNumberish} from 'ethers';
import axios from 'axios';
import {
  CurrencySymbols,
  CurrencyList,
  Networks,
  TimePeriod,
  Env,
} from '../config';

interface WalletBalance {
  quoteCurrency: CurrencySymbols;
  previousBalance: BigNumberish;
  currentBalance: BigNumberish;
}

interface CurrencyBalance {
  currency: CurrencySymbols;
  quoteCurrency: CurrencySymbols;
  balance: BigNumberish;
  previousBalanceInQuoteCurrency: BigNumberish;
  currentBalanceInQuoteCurrency: BigNumberish;
}

interface AddressOverviewResponse {
  walletBalance: WalletBalance;
  currencies: Array<CurrencyBalance>;
}

interface ExplorerStateConstants {
  loading: boolean;
  walletBalance: WalletBalance;
  currencies: Array<CurrencyBalance>;
}

interface ExplorerState extends ExplorerStateConstants {
  fetchAddressOverview: (
    network: Networks,
    quoteCurrency: CurrencySymbols,
    timePeriod: TimePeriod,
    address: string,
  ) => Promise<void>;
  clear: () => void;

  hasHydrated: boolean;
  setHasHydrated: (flag: boolean) => void;
}

const defaults: ExplorerStateConstants = {
  loading: false,
  walletBalance: {
    quoteCurrency: 'USDC',
    previousBalance: '0',
    currentBalance: '0',
  },
  currencies: [],
};
const STORE_NAME = 'stackup-explorer-store';
const useExplorerStore = create<ExplorerState>()(
  devtools(
    persist(
      set => ({
        ...defaults,

        fetchAddressOverview: async (
          network,
          quoteCurrency,
          timePeriod,
          address,
        ) => {
          try {
            set({loading: true});
            const response = await axios.post<AddressOverviewResponse>(
              `${Env.EXPLORER_URL}/v1/address/${address}`,
              {
                network,
                quoteCurrency,
                timePeriod,
                currencies: CurrencyList,
              },
            );
            const data = response.data;

            set({
              loading: false,
              walletBalance: data.walletBalance,
              currencies: data.currencies,
            });
          } catch (error) {
            set({loading: false});
            throw error;
          }
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

export const useExplorerStoreRemoveWalletSelector = () =>
  useExplorerStore(state => ({clear: state.clear}));

export const useExplorerStoreHomeSelector = () =>
  useExplorerStore(state => ({currencies: state.currencies}));

export const useExplorerStoreAssetsSelector = () =>
  useExplorerStore(state => ({
    loading: state.loading,
    walletBalance: state.walletBalance,
    currencies: state.currencies,
    fetchAddressOverview: state.fetchAddressOverview,
  }));
