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

export const recoverRecoverNewPasswordPageSelector = (state) => ({
  loading: state.loading,
  user: state.user,
  guardians: state.guardians,
  createEphemeralSigner: state.createEphemeralSigner,
});

export const recoverRecoverVerifyEmailPageSelector = (state) => ({
  loading: state.loading,
  newOwner: state.newOwner,
  guardians: state.guardians,
  sendVerificationEmail: state.sendVerificationEmail,
  verifyEmail: state.verifyEmail,
});

const defaultState = {
  loading: false,
  user: undefined,
  encryptedSigner: undefined,
  newOwner: undefined,
  guardians: undefined,
  guardianRecoveryArray: undefined,
};

export const useRecoverStore = create(
  devtools(
    persist(
      (set, get) => ({
        ...defaultState,

        createEphemeralSigner: (password) => {
          const { encryptedSigner } = wallet.proxy.initEncryptedIdentity(password);
          const newOwner = wallet.proxy.decryptSigner({ encryptedSigner }, password).address;

          set({ encryptedSigner, newOwner });
        },

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

            const account = { user, guardians };
            set({ loading: false, ...account });
            return account;
          } catch (error) {
            set({ loading: false });
            throw error;
          }
        },

        sendVerificationEmail: async () => {
          if (!get().user) return;
          set({ loading: true });

          try {
            await axios.post(`${App.stackup.backendUrl}/v1/auth/recover/send-verification-email`, {
              username: get().user.username,
            });

            set({ loading: false });
          } catch (error) {
            set({ loading: false });
            throw error;
          }
        },

        verifyEmail: async (code) => {
          if (!get().user || !get().newOwner) return;
          set({ loading: true });

          try {
            const res = await axios.post(`${App.stackup.backendUrl}/v1/auth/recover/verify-email`, {
              username: get().user.username,
              code,
              newOwner: get().newOwner,
            });

            set({ loading: false, guardianRecoveryArray: [res.data.guardianRecovery] });
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
