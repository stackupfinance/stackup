import {Platform} from 'react-native';
import create from 'zustand';
import {persist, devtools} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

interface FingerprintState {
  loading: boolean;
  isSupported: boolean;
  isEnabled: boolean;

  checkDevice: () => Promise<void>;
  setMasterPassword: (password: string, salt: string) => Promise<void>;
  getMasterPassword: () => Promise<string | undefined>;
  resetMasterPassword: () => Promise<void>;

  hasHydrated: boolean;
  setHasHydrated: (flag: boolean) => void;
}

const delay = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const STORE_NAME = 'stackup-fingerprint-store';
const useFingerprintStore = create<FingerprintState>()(
  devtools(
    persist(
      set => ({
        loading: false,
        isSupported: false,
        isEnabled: false,

        checkDevice: async () => {
          set({loading: true});

          const biometryType = await Keychain.getSupportedBiometryType();
          const isSupported =
            (Platform.OS === 'ios' &&
              biometryType === Keychain.BIOMETRY_TYPE.TOUCH_ID) ||
            (Platform.OS === 'android' &&
              biometryType === Keychain.BIOMETRY_TYPE.FINGERPRINT);

          set({loading: false, isSupported});
        },

        setMasterPassword: async (password, salt) => {
          set({loading: true});

          await Keychain.setGenericPassword(salt, password, {
            accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
          });

          set({loading: false, isEnabled: true});
        },

        getMasterPassword: async () => {
          set({loading: true});

          try {
            // TODO: Fix this hacky workaround.
            // Related: https://github.com/oblador/react-native-keychain/issues/525
            await delay(500);

            const credentials = await Keychain.getGenericPassword();
            set({loading: false});
            return credentials ? credentials.password : undefined;
          } catch (error) {
            set({loading: false});
            return undefined;
          }
        },

        resetMasterPassword: async () => {
          set({loading: true});

          await Keychain.resetGenericPassword();

          set({loading: false, isEnabled: false});
        },

        hasHydrated: false,
        setHasHydrated: flag => {
          set({hasHydrated: flag});
        },
      }),
      {
        name: STORE_NAME,
        getStorage: () => AsyncStorage,
        partialize: state => {
          const {loading, hasHydrated, ...persisted} = state;
          return persisted;
        },
        onRehydrateStorage: () => state => {
          state?.setHasHydrated(true);
        },
      },
    ),
    {name: STORE_NAME},
  ),
);

export const useFingerprintStoreRemoveWalletSelector = () =>
  useFingerprintStore(state => ({
    resetMasterPassword: state.resetMasterPassword,
  }));

export const useFingerprintStoreAuthSelector = () =>
  useFingerprintStore(state => ({
    isEnabled: state.isEnabled,
    checkDevice: state.checkDevice,
    getMasterPassword: state.getMasterPassword,
    hasHydrated: state.hasHydrated,
  }));

export const useFingerprintStoreAssetsSheetsSelector = () =>
  useFingerprintStore(state => ({
    isEnabled: state.isEnabled,
    getMasterPassword: state.getMasterPassword,
  }));

export const useFingerprintStoreSwapSheetsSelector = () =>
  useFingerprintStore(state => ({
    isEnabled: state.isEnabled,
    getMasterPassword: state.getMasterPassword,
  }));

export const useFingerprintStoreWelcomeSelector = () =>
  useFingerprintStore(state => ({
    loading: state.loading,
    isSupported: state.isSupported,
  }));

export const useFingerprintStorePasswordSelector = () =>
  useFingerprintStore(state => ({
    setMasterPassword: state.setMasterPassword,
  }));

export const useFingerprintStoreWalletRecoveredSelector = () =>
  useFingerprintStore(state => ({
    loading: state.loading,
    setMasterPassword: state.setMasterPassword,
  }));

export const useFingerprintStoreWalletConnectSheetsSelector = () =>
  useFingerprintStore(state => ({
    loading: state.loading,
    isEnabled: state.isEnabled,
    getMasterPassword: state.getMasterPassword,
  }));

export const useFingerprintStoreSecuritySheetsSelector = () =>
  useFingerprintStore(state => ({
    loading: state.loading,
    isSupported: state.isSupported,
    isEnabled: state.isEnabled,
    getMasterPassword: state.getMasterPassword,
    setMasterPassword: state.setMasterPassword,
    resetMasterPassword: state.resetMasterPassword,
  }));
