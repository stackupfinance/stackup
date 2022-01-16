import create from 'zustand';
import { persist } from 'zustand/middleware';
import { wallet } from '@stackupfinance/contracts';
import axios from 'axios';
import { App } from '../config';
import { provider, walletContract } from '../utils/web3';

export const updateUseAuthSelector = (state) => ({
  clear: state.clear,
});

export const updateHomePageSelector = (state) => ({
  clear: state.clear,
});

export const updateUpdateEditGuardiansPageSelector = (state) => ({
  loading: state.loading,
  guardianMap: state.guardianMap,
  currentGuardians: state.currentGuardians,
  getWalletGuardians: state.getWalletGuardians,
  setGuardian: state.setGuardian,
  removeGuardian: state.removeGuardian,
});

export const updateUpdateConfirmGuardiansPageSelector = (state) => ({
  loading: state.loading,
  guardianMap: state.guardianMap,
  currentGuardians: state.currentGuardians,
});

export const updateUpdateAddEmailPageSelector = (state) => ({
  guardianMap: state.guardianMap,
  setEmail: state.setEmail,
});

export const updateUpdateVerifyEmailPageSelector = (state) => ({
  email: state.email,
});

const defaultState = {
  loading: false,
  currentGuardians: undefined,
  guardianMap: undefined,
  email: undefined,
};

export const useUpdateStore = create(
  persist(
    (set, get) => ({
      ...defaultState,

      getWalletGuardians: async (userWallet, options) => {
        set({ loading: true });

        try {
          const isDeployed = await wallet.proxy.isCodeDeployed(provider, userWallet.walletAddress);
          const guardians = isDeployed
            ? await wallet.access.getGuardians(walletContract(userWallet.walletAddress))
            : userWallet.initGuardians;
          const userGuardians = guardians.filter((g) => g !== App.web3.paymaster);
          const guardianMap = {
            ...(guardians.includes(App.web3.paymaster)
              ? { defaultGuardian: App.web3.paymaster }
              : {}),
          };

          if (userGuardians.length > 0) {
            const res = await axios.post(
              `${App.stackup.backendUrl}/v1/users/${options.userId}/wallet/hydrate-guardians`,
              { guardians: userGuardians },
              { headers: { Authorization: `Bearer ${options.accessToken}` } },
            );

            res.data.guardians.map((g) => {
              guardianMap[g.username] = g.wallet.walletAddress;
            });
          }

          set({ loading: false, currentGuardians: guardians, guardianMap });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      setGuardian: (guardian, address) => {
        const guardianMap = get().guardianMap;
        guardianMap[guardian] = address;
        set({ guardianMap });
      },

      removeGuardian: (guardian) => {
        const { [guardian]: _, ...rest } = get().guardianMap;
        set({ guardianMap: rest });
      },

      setEmail: (email) => set({ email }),

      clear: () => set({ ...defaultState }),
    }),
    {
      name: 'stackup-update-store',
      partialize: (state) => {
        const { loading, ...persisted } = state;
        return persisted;
      },
    },
  ),
);
