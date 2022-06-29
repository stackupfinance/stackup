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

interface WalletStatus {
  isDeployed: boolean;
  nonce: number;
}

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
  walletStatus: WalletStatus;
  walletBalance: WalletBalance;
  currencies: Array<CurrencyBalance>;
}

interface ExplorerStateConstants {
  loading: boolean;
  walletStatus: WalletStatus;
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
  walletStatus: {
    isDeployed: false,
    nonce: 0,
  },
  walletBalance: {
    quoteCurrency: 'USDC',
    previousBalance: '0',
    currentBalance: '0',
  },
  currencies: [
    {
      currency: 'USDC',
      quoteCurrency: 'USDC',
      balance: '0',
      previousBalanceInQuoteCurrency: '0',
      currentBalanceInQuoteCurrency: '0',
    },
  ],
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
              walletStatus: data.walletStatus,
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
  useExplorerStore(state => ({
    walletStatus: state.walletStatus,
    currencies: state.currencies,
    fetchAddressOverview: state.fetchAddressOverview,
  }));

export const useExplorerStoreAssetsSelector = () =>
  useExplorerStore(state => ({
    loading: state.loading,
    walletBalance: state.walletBalance,
    currencies: state.currencies,
    fetchAddressOverview: state.fetchAddressOverview,
  }));
