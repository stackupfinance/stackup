import create from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { wallet as walletLib } from '@stackupfinance/walletjs';
import { loginMessage } from '../utils/web3';
import { App } from '../config';

export const accountUseAuthSelector = (state) => ({
  wallet: state.wallet,
  accessToken: state.accessToken,
  refreshToken: state.refreshToken,
  logout: state.logout,
  refresh: state.refresh,
  enableAccount: state.enableAccount,
});

export const accountIntercomManagerSelector = (state) => ({
  accessToken: state.accessToken,
  user: state.user,
});

export const accountWeb3TransactionsSelector = (state) => ({
  wallet: state.wallet,
  accessToken: state.accessToken,
  user: state.user,
});

export const accountPusherSelector = (state) => ({
  enabled: state.enabled,
  accessToken: state.accessToken,
  user: state.user,
});

export const accountLoginPageSelector = (state) => ({
  loading: state.loading,
  login: state.login,
});

export const accountSignUpPageSelector = (state) => ({
  loading: state.loading,
  register: state.register,
});

export const accountWelcomePageSelector = (state) => ({
  user: state.user,
});

export const accountHomePageSelector = (state) => ({
  enabled: state.enabled,
  loading: state.loading,
  user: state.user,
  wallet: state.wallet,
  accessToken: state.accessToken,
});

export const accountActivityPageSelector = (state) => ({
  enabled: state.enabled,
  user: state.user,
  wallet: state.wallet,
  accessToken: state.accessToken,
});

export const accountOnboardRecoveryPageSelector = (state) => ({
  enabled: state.enabled,
  loading: state.loading,
  user: state.user,
  accessToken: state.accessToken,
  saveEncryptedWallet: state.saveEncryptedWallet,
});

export const accountOnboardAddEmailPageSelector = (state) => ({
  enabled: state.enabled,
  loading: state.loading,
  user: state.user,
  patchUser: state.patchUser,
});

export const accountOnboardVerifyEmailPageSelector = (state) => ({
  enabled: state.enabled,
  loading: state.loading,
  user: state.user,
  sendVerificationEmail: state.sendVerificationEmail,
  verifyEmail: state.verifyEmail,
});

export const accountOnboardSummaryPageSelector = (state) => ({
  enabled: state.enabled,
  loading: state.loading,
  user: state.user,
  saveEncryptedWallet: state.saveEncryptedWallet,
});

export const accountRecoverApproveRequestPageSelector = (state) => ({
  enabled: state.enabled,
  user: state.user,
  wallet: state.wallet,
  accessToken: state.accessToken,
});

export const accountUpdateEditGuardiansPageSelector = (state) => ({
  enabled: state.enabled,
  loading: state.loading,
  user: state.user,
  wallet: state.wallet,
  accessToken: state.accessToken,
});

export const accountUpdateConfirmGuardiansPageSelector = (state) => ({
  enabled: state.enabled,
  loading: state.loading,
  user: state.user,
  wallet: state.wallet,
  accessToken: state.accessToken,
  getUser: state.getUser,
  patchUser: state.patchUser,
});

export const accountUpdateAddEmailPageSelector = (state) => ({
  enabled: state.enabled,
  loading: state.loading,
  patchUser: state.patchUser,
});

export const accountUpdateVerifyEmailPageSelector = (state) => ({
  enabled: state.enabled,
  loading: state.loading,
  sendVerificationEmail: state.sendVerificationEmail,
  verifyEmail: state.verifyEmail,
});

export const accountUpdatePasswordPageSelector = (state) => ({
  enabled: state.enabled,
  loading: state.loading,
  updatePassword: state.updatePassword,
});

export const accountFiatDepositPageSelector = (state) => ({
  enabled: state.enabled,
  user: state.user,
  accessToken: state.accessToken,
});

export const accountHoldingsPageSelector = (state) => ({
  enabled: state.enabled,
  loading: state.loading,
  user: state.user,
  wallet: state.wallet,
  accessToken: state.accessToken,
});

const defaultState = {
  enabled: false,
  loading: false,
  user: undefined,
  wallet: undefined,
  accessToken: undefined,
  refreshToken: undefined,
};

export const useAccountStore = create(
  persist(
    (set, get) => ({
      ...defaultState,

      register: async (data) => {
        set({ loading: true });

        try {
          const register = await axios.post(
            `${App.stackup.backendUrl}/v1/auth/register`,
            {
              username: data.username,
              wallet: await walletLib.proxy.initEncryptedIdentity(data.password, data.username),
            },
            {
              params: { inviteCode: data.inviteCode },
            },
          );

          const { wallet, ...user } = register.data.user;
          const accessToken = register.data.tokens.access;
          const refreshToken = register.data.tokens.refresh;

          set({
            loading: false,
            user,
            wallet,
            accessToken,
            refreshToken,
          });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      login: async (data) => {
        set({ loading: true });

        try {
          const lookup = await axios.post(`${App.stackup.backendUrl}/v1/auth/lookup`, {
            username: data.username,
          });
          const signer = await walletLib.proxy.decryptSigner(
            lookup.data.user.wallet,
            data.password,
            data.username,
          );
          if (!signer) throw new Error('Incorrect password');

          const timestamp = Date.now();
          const login = await axios.post(`${App.stackup.backendUrl}/v1/auth/login`, {
            username: data.username,
            signature: await signer.signMessage(`${loginMessage}${timestamp}`),
            timestamp,
          });
          const { wallet, ...user } = login.data.user;
          const accessToken = login.data.tokens.access;
          const refreshToken = login.data.tokens.refresh;

          set({
            loading: false,
            user,
            wallet,
            accessToken,
            refreshToken,
          });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ loading: true });

        try {
          await axios.post(`${App.stackup.backendUrl}/v1/auth/logout`, {
            refreshToken: get().refreshToken?.token,
          });

          set({ ...defaultState });
        } catch (error) {
          set({ ...defaultState });
          throw error;
        }
      },

      refresh: async () => {
        set({ loading: true });

        try {
          const res = await axios.post(`${App.stackup.backendUrl}/v1/auth/refresh-tokens`, {
            refreshToken: get().refreshToken?.token,
          });

          set({
            loading: false,
            accessToken: res.data.access,
            refreshToken: res.data.refresh,
          });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      getUser: async () => {
        set({ loading: true });

        try {
          const res = await axios.get(`${App.stackup.backendUrl}/v1/users/${get().user?.id}`, {
            headers: { Authorization: `Bearer ${get().accessToken?.token}` },
          });

          const { wallet, ...user } = res.data;
          set({ loading: false, user, wallet });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      patchUser: async (data) => {
        set({ loading: true });

        try {
          await axios.patch(`${App.stackup.backendUrl}/v1/users/${get().user?.id}`, data, {
            headers: { Authorization: `Bearer ${get().accessToken?.token}` },
          });

          set({ loading: false });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      sendVerificationEmail: async () => {
        set({ loading: true });

        try {
          await axios.post(
            `${App.stackup.backendUrl}/v1/auth/send-verification-email`,
            {},
            {
              headers: { Authorization: `Bearer ${get().accessToken?.token}` },
            },
          );

          set({ loading: false });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      verifyEmail: async (code) => {
        set({ loading: true });

        try {
          await axios.post(
            `${App.stackup.backendUrl}/v1/auth/verify-email`,
            { code },
            {
              headers: { Authorization: `Bearer ${get().accessToken?.token}` },
            },
          );

          await get().getUser();
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      saveEncryptedWallet: async (wallet) => {
        set({ loading: true });

        try {
          await axios.patch(`${App.stackup.backendUrl}/v1/users/${get().user?.id}/wallet`, wallet, {
            headers: { Authorization: `Bearer ${get().accessToken?.token}` },
          });
          await get().patchUser({ isOnboarded: true });

          await get().getUser();
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      updatePassword: async (data) => {
        set({ loading: true });

        try {
          const encryptedSigner = await walletLib.proxy.reencryptSigner(
            get().wallet,
            data.password,
            data.newPassword,
            get().user.username,
          );
          if (!encryptedSigner) {
            throw new Error('Incorrect password');
          }

          await axios.patch(
            `${App.stackup.backendUrl}/v1/users/${get().user?.id}/wallet`,
            { encryptedSigner },
            {
              headers: { Authorization: `Bearer ${get().accessToken?.token}` },
            },
          );

          await get().getUser();
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      enableAccount: () => {
        set({ enabled: Boolean(get().refreshToken) });
      },
    }),
    {
      name: 'stackup-account-store',
      partialize: (state) => {
        const { enabled, loading, ...persisted } = state;
        return persisted;
      },
    },
  ),
);
