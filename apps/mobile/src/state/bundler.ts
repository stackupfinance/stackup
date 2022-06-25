import create from 'zustand';
import {devtools} from 'zustand/middleware';
import axios from 'axios';
import {Env, CurrencyBalances, Networks} from '../config';

interface StatusResponse {
  address: string;
  fees: CurrencyBalances;
  allowances: CurrencyBalances;
}

interface BundlerStateConstants {
  loading: boolean;
}

interface BundlerState extends BundlerStateConstants {
  fetchPaymasterStatus: (
    address: string,
    network: Networks,
  ) => Promise<StatusResponse>;

  clear: () => void;
}

const defaults: BundlerStateConstants = {
  loading: false,
};
const STORE_NAME = 'stackup-bundler-store';
const useBundlerStore = create<BundlerState>()(
  devtools(
    set => ({
      ...defaults,

      fetchPaymasterStatus: async (address, network) => {
        try {
          set({loading: true});

          const response = await axios.get<StatusResponse>(
            `${Env.BUNDLER_URL}/v1/paymaster/status`,
            {params: {address, network}},
          );

          set({loading: false});
          return response.data;
        } catch (error) {
          set({loading: false});
          throw error;
        }
      },

      clear: () => {
        set({...defaults});
      },
    }),
    {name: STORE_NAME},
  ),
);

export const useBundlerStoreRemoveWalletSelector = () =>
  useBundlerStore(state => ({clear: state.clear}));

export const useBundlerStoreUserOpHooksSelector = () =>
  useBundlerStore(state => ({
    loading: state.loading,
    fetchPaymasterStatus: state.fetchPaymasterStatus,
  }));
