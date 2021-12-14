import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { wallet } from '@stackupfinance/contracts';

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

export const onboardOnboardRecoveryPageSelector = (state) => ({
  ephemeralWallet: state.ephemeralWallet,
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

        createEphemeralWallet: (password) =>
          set({ ephemeralWallet: wallet.proxy.initEncryptedIdentity(password) }),

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
