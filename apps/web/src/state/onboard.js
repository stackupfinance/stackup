import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { wallet } from '@stackupfinance/contracts';
import { App } from '../config';

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
  guardianMap: state.guardianMap,
  setGuardian: state.setGuardian,
  removeGuardian: state.removeGuardian,
});

export const onboardOnboardAddEmailPageSelector = (state) => ({
  guardianMap: state.guardianMap,
  setEmail: state.setEmail,
});

export const onboardOnboardVerifyEmailPageSelector = (state) => ({
  email: state.email,
});

export const onboardOnboardSummaryPageSelector = (state) => ({
  ephemeralWallet: state.ephemeralWallet,
  guardianMap: state.guardianMap,
});

const defaultState = {
  loading: false,
  ephemeralWallet: undefined,
  guardianMap: { defaultGuardian: App.web3.paymaster },
  email: undefined,
};

export const useOnboardStore = create(
  devtools(
    persist(
      (set, get) => ({
        ...defaultState,

        createEphemeralWallet: (password) =>
          set({ ephemeralWallet: wallet.proxy.initEncryptedIdentity(password) }),

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
        name: 'stackup-onboard-store',
        partialize: (state) => {
          const { loading, ...persisted } = state;
          return persisted;
        },
      },
    ),
  ),
);
