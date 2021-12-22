import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import axios from 'axios';
import { wallet } from '@stackupfinance/contracts';
import { provider, walletContract } from '../../src/utils/web3';
import { App } from '../config';

export const recoverUseAuthSelector = (state) => ({
  clear: state.clear,
});

export const recoverHomePageSelector = (state) => ({
  clear: state.clear,
});

export const recoverRecoverLookupPageSelector = (state) => ({
  loading: state.loading,
  lookup: state.lookup,
});

const defaultState = {
  loading: false,
  user: undefined,
  isDeployed: undefined,
  guardians: undefined,
};

export const useRecoverStore = create(
  devtools(
    persist(
      (set, get) => ({
        ...defaultState,

        lookup: async (data) => {
          set({ loading: true });

          try {
            const res = await axios.post(`${App.stackup.backendUrl}/v1/auth/recover/lookup`, data);

            const { user } = res.data;
            const isDeployed =
              (user.wallet?.walletAddress &&
                (await wallet.proxy.isCodeDeployed(provider, user.wallet.walletAddress))) ||
              false;
            const guardians = isDeployed
              ? await wallet.access.getGuardians(walletContract(user.wallet.walletAddress))
              : user.wallet?.initGuardians ?? [];

            const account = { user, isDeployed, guardians };
            set({ loading: false, ...account });
            return account;
          } catch (error) {
            set({ loading: false });
            throw error;
          }
        },

        clear: () => set({ ...defaultState }),
      }),
      {
        name: 'stackup-recover-store',
        partialize: (state) => {
          const { loading, ...persisted } = state;
          return persisted;
        },
      },
    ),
  ),
);
