import create from 'zustand';
import {persist, devtools} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ethers} from 'ethers';
import {wallet} from '@stackupfinance/walletjs';

interface WalletStateConstants {
  loading: boolean;
  instance: wallet.WalletInstance;
}

interface WalletState extends WalletStateConstants {
  create: (
    password: string,
    salt: string,
    onCreate?: (password: string, salt: string) => Promise<void>,
  ) => Promise<void>;
  remove: () => void;

  hasHydrated: boolean;
  setHasHydrated: (flag: boolean) => void;
}

const defaults: WalletStateConstants = {
  loading: false,

  // This is just a dummy instance and does not represent a real wallet.
  instance: {
    walletAddress: ethers.constants.AddressZero,
    initImplementation: ethers.constants.AddressZero,
    initGuardians: [ethers.constants.AddressZero],
    initOwner: ethers.constants.AddressZero,
    salt: '',
    encryptedSigner: '',
  },
};
const STORE_NAME = 'stackup-wallet-store';
const useWalletStore = create<WalletState>()(
  devtools(
    persist(
      set => ({
        ...defaults,

        create: async (password, salt, onCreate) => {
          set({loading: true});

          setTimeout(async () => {
            const instance = await wallet.createRandom(password, salt);
            await onCreate?.(password, salt);

            set({loading: false, instance});
          });
        },

        remove: () => {
          set({...defaults});
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

export const useWalletStoreHomeSelector = () =>
  useWalletStore(state => ({instance: state.instance}));

export const useWalletStoreAssetsSelector = () =>
  useWalletStore(state => ({instance: state.instance}));
