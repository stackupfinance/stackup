import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { initWallet } from '../utils/wallets';

export const onboardUseAuthSelector = (state) => ({
  clear: state.clear,
});

export const onboardLoginPageSelector = (state) => ({
  createEphemeralWallet: state.createEphemeralWallet,
});

export const onboardSignUpPageSelector = (state) => ({
  createEphemeralWallet: state.createEphemeralWallet,
});

export const onboardHomePageSelector = (state) => ({
  clear: state.clear,
});

const defaultState = {
  loading: false,
  ephemeralWallet: undefined,
};

export const useOnboardStore = create(
  devtools(
    persist(
      (set, get) => ({
        ...defaultState,

        createEphemeralWallet: (password) => set({ ephemeralWallet: initWallet(password) }),

        clear: () => set({ ...defaultState }),
      }),
      {
        name: 'stackup-onboard-store',
        partialize: (state) => {
          const { loading, ...persisted } = state;
          return persisted;
        },
      },
    ),
  ),
);
