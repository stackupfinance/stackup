import create from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import axios from 'axios';
import { App } from '../config';

export const accountUseAuthSelector = (state) => ({
  accessToken: state.accessToken,
  refreshToken: state.refreshToken,
  logout: state.logout,
  refresh: state.refresh,
  enableAccount: state.enableAccount,
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
  wallet: state.wallet,
  accessToken: state.accessToken,
  saveEncryptedWallet: state.saveEncryptedWallet,
});

export const accountOnboardAddEmailPageSelector = (state) => ({
  enabled: state.enabled,
  loading: state.loading,
  wallet: state.wallet,
  patchUser: state.patchUser,
});

export const accountOnboardVerifyEmailPageSelector = (state) => ({
  enabled: state.enabled,
  loading: state.loading,
  wallet: state.wallet,
  sendVerificationEmail: state.sendVerificationEmail,
  verifyEmail: state.verifyEmail,
});

export const accountOnboardSummaryPageSelector = (state) => ({
  enabled: state.enabled,
  loading: state.loading,
  user: state.user,
  wallet: state.wallet,
  saveEncryptedWallet: state.saveEncryptedWallet,
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
  devtools(
    persist(
      (set, get) => ({
        ...defaultState,

        register: async (data) => {
          set({ loading: true });

          try {
            const register = await axios.post(`${App.stackup.backendUrl}/v1/auth/register`, data);
            const user = register.data.user;
            const accessToken = register.data.tokens.access;
            const refreshToken = register.data.tokens.refresh;

            set({
              loading: false,
              user,
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
            const login = await axios.post(`${App.stackup.backendUrl}/v1/auth/login`, data);
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
            await axios.post(
              `${App.stackup.backendUrl}/v1/users/${get().user?.id}/wallet`,
              wallet,
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
  ),
);
