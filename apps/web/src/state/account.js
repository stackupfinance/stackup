import create from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import axios from 'axios';
import { App } from '../config';
import { initWallet } from '../utils/wallets';

export const accountSignUpPageSelector = (state) => ({
  register: state.register,
  loading: state.loading,
});

export const useAccountStore = create(
  devtools(
    persist(
      (set, _get) => ({
        loading: false,
        user: undefined,
        wallet: undefined,
        accessToken: undefined,
        refreshToken: undefined,

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

        login: () => set(),
      }),
      {
        name: 'stackup-account-store',
      },
    ),
  ),
);
