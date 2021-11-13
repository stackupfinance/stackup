import create from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { App } from '../config';
import axios from 'axios';

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
            const res = await axios.post(`${App.stackup.backendUrl}/v1/auth/register`, data);
            set({
              loading: false,
              user: res.data.user,
              accessToken: res.data.tokens.access,
              refreshToken: res.data.tokens.refresh,
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
