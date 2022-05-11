import create from 'zustand';
import {persist, devtools} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {wallet} from '@stackupfinance/walletjs';

interface WalletInstance {
  walletAddress: string;
  initImplementation: string;
  initEntryPoint: string;
  initOwner: string;
  initGuardians: Array<string>;
  salt: string;
  encryptedSigner: string;
}

interface WalletState {
  loading: boolean;
  instance: WalletInstance | undefined;

  create: (
    password: string,
    salt: string,
    onCreate?: (password: string, salt: string) => Promise<void>,
  ) => Promise<void>;
  remove: () => void;

  hasHydrated: boolean;
  setHasHydrated: (flag: boolean) => void;
}

const STORE_NAME = 'stackup-wallet-store';
const useWalletStore = create<WalletState>()(
  devtools(
    persist(
      set => ({
        loading: false,
        instance: undefined,

        create: async (password, salt, onCreate) => {
          set({loading: true});

          setTimeout(async () => {
            const instance = await wallet.createRandom(password, salt);
            await onCreate?.(password, salt);

            set({loading: false, instance});
          });
        },

        remove: () => {
          set({instance: undefined});
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

export const useWalletStoreRemoveWalletSelector = () =>
  useWalletStore(state => ({remove: state.remove}));

export const useWalletStoreAuthSelector = () =>
  useWalletStore(state => ({
    instance: state.instance,
    hasHydrated: state.hasHydrated,
  }));

export const useWalletStoreCreateWalletSelector = () =>
  useWalletStore(state => ({
    loading: state.loading,
    create: state.create,
  }));
