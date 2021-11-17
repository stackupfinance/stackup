import create from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import axios from 'axios';
import { App } from '../config';
import { initWallet } from '../utils/wallets';

export const accountUseAuthSelector = (state) => ({
  accessToken: state.accessToken,
  refreshToken: state.refreshToken,
  logout: state.logout,
  refresh: state.refresh,
  enableAccount: state.enableAccount,
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
  accessToken: state.accessToken,
  logout: state.logout,
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

            const wallet = initWallet(data.password);
            await axios.post(`${App.stackup.backendUrl}/v1/users/${user.id}/wallet`, wallet, {
              headers: { Authorization: `Bearer ${accessToken.token}` },
            });

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
            const register = await axios.post(`${App.stackup.backendUrl}/v1/auth/login`, data);
            const user = register.data.user;
            const accessToken = register.data.tokens.access;
            const refreshToken = register.data.tokens.refresh;

            const wallet = initWallet(data.password);
            await axios.get(`${App.stackup.backendUrl}/v1/users/${user.id}/wallet`, {
              headers: { Authorization: `Bearer ${accessToken.token}` },
            });

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
            set({ loading: false });
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

        enableAccount: () => {
          set({ enabled: true });
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
