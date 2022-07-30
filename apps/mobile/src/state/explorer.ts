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
  GasEstimate,
  OptimalQuote,
  WalletStatus,
  Env,
  ActivityItem,
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
  walletStatus: WalletStatus;
  walletBalance: WalletBalance;
  currencies: Array<CurrencyBalance>;
}

interface GetActivityResponse {
  items: Array<ActivityItem>;
}

interface SwapQuoteResponse {
  quote: OptimalQuote | null;
}

interface ExplorerStateConstants {
  loading: boolean;
  walletStatus: WalletStatus;
  walletBalance: WalletBalance;
  currencies: Array<CurrencyBalance>;
  activity: Array<ActivityItem>;
}

interface ExplorerState extends ExplorerStateConstants {
  fetchAddressOverview: (
    network: Networks,
    quoteCurrency: CurrencySymbols,
    timePeriod: TimePeriod,
    address: string,
  ) => Promise<void>;
  fetchGasEstimate: (network: Networks) => Promise<GasEstimate>;
  fetchSwapQuote: (
    network: Networks,
    baseCurrency: CurrencySymbols,
    quoteCurrency: CurrencySymbols,
    value: BigNumberish,
    address: string,
  ) => Promise<OptimalQuote | null>;
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
  activity: [],
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
            const [addressResponse, activityResponse] = await Promise.all([
              axios.post<AddressOverviewResponse>(
                `${Env.EXPLORER_URL}/v1/address/${address}`,
                {
                  network,
                  quoteCurrency,
                  timePeriod,
                  currencies: CurrencyList,
                },
              ),
              axios.get<GetActivityResponse>(
                `${Env.EXPLORER_URL}/v1/address/${address}/activity`,
                {params: {network, page: 1}},
              ),
            ]);
            const addressData = addressResponse.data;
            const activityData = activityResponse.data;

            set({
              loading: false,
              walletStatus: addressData.walletStatus,
              walletBalance: addressData.walletBalance,
              currencies: addressData.currencies,
              activity: activityData.items,
            });
          } catch (error) {
            set({loading: false});
            throw error;
          }
        },

        fetchGasEstimate: async (network: Networks) => {
          try {
            set({loading: true});
            const response = await axios.get<GasEstimate>(
              `${Env.EXPLORER_URL}/v1/gas/estimator`,
              {params: {network}},
            );

            set({loading: false});
            return response.data;
          } catch (error) {
            set({loading: false});
            throw error;
          }
        },

        fetchSwapQuote: async (
          network,
          baseCurrency,
          quoteCurrency,
          value,
          address,
        ) => {
          try {
            set({loading: true});
            const response = await axios.get<SwapQuoteResponse>(
              `${Env.EXPLORER_URL}/v1/swap/quote`,
              {params: {network, baseCurrency, quoteCurrency, value, address}},
            );

            set({loading: false});
            return response.data.quote;
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

export const useExplorerStoreUserOpHooksSelector = () =>
  useExplorerStore(state => ({
    fetchGasEstimate: state.fetchGasEstimate,
  }));

export const useExplorerStoreAssetsSheetsSelector = () =>
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

export const useExplorerStoreSwapSelector = () =>
  useExplorerStore(state => ({
    loading: state.loading,
    currencies: state.currencies,
    fetchGasEstimate: state.fetchGasEstimate,
    fetchSwapQuote: state.fetchSwapQuote,
  }));

export const useExplorerStoreSwapSheetsSelector = () =>
  useExplorerStore(state => ({
    currencies: state.currencies,
    walletStatus: state.walletStatus,
    fetchAddressOverview: state.fetchAddressOverview,
  }));

export const useExplorerStoreWalletConnectSheetsSelector = () =>
  useExplorerStore(state => ({
    loading: state.loading,
    currencies: state.currencies,
    walletStatus: state.walletStatus,
    fetchGasEstimate: state.fetchGasEstimate,
    fetchAddressOverview: state.fetchAddressOverview,
  }));

export const useExplorerStoreActivitySelector = () =>
  useExplorerStore(state => ({
    loading: state.loading,
    activity: state.activity,
    fetchAddressOverview: state.fetchAddressOverview,
  }));
