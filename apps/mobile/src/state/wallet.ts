import create from 'zustand';
import {persist, devtools} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ethers} from 'ethers';
import axios from 'axios';
import {wallet} from '@stackupfinance/walletjs';
import {Env} from '../config';

interface WalletStateConstants {
  loading: boolean;
  instance: wallet.WalletInstance;
}

interface WalletState extends WalletStateConstants {
  create: (
    password: string,
    salt: string,
    callback?: () => Promise<void>,
  ) => Promise<void>;
  pingBackup: (walletAddress: string) => Promise<Boolean>;
  verifyEncryptedBackup: (
    walletAddress: string,
    password: string,
  ) => Promise<wallet.WalletInstance | undefined>;
  setFromVerifiedBackup: (instance: wallet.WalletInstance) => void;
  getWalletSigner: (password: string) => Promise<ethers.Wallet | undefined>;
  reencryptWalletSigner: (
    password: string,
    newPassword: string,
  ) => Promise<string | undefined>;

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
      (set, get) => ({
        ...defaults,

        create: async (password, salt, callback) => {
          set({loading: true});

          setTimeout(async () => {
            try {
              const instance = await wallet.createRandom(password, salt);
              await axios.post(`${Env.BACKUP_URL}/v1/wallet`, {...instance});
              await callback?.();

              set({loading: false, instance});
            } catch (error) {
              set({loading: false});
              throw error;
            }
          });
        },

        pingBackup: async walletAddress => {
          set({loading: true});

          try {
            const response = await axios.post<{exist: boolean}>(
              `${Env.BACKUP_URL}/v1/wallet/ping`,
              {walletAddress},
            );

            set({loading: false});
            return response.data.exist;
          } catch (error) {
            set({loading: false});
            throw error;
          }
        },

        verifyEncryptedBackup: async (walletAddress, password) => {
          set({loading: true});

          try {
            const response = await axios.post<wallet.WalletInstance>(
              `${Env.BACKUP_URL}/v1/wallet/fetch`,
              {walletAddress},
            );
            const walletInstance = response.data;
            const signer = await wallet.decryptSigner(
              walletInstance,
              password,
              walletInstance.salt,
            );

            set({loading: false});
            return signer ? walletInstance : undefined;
          } catch (error) {
            set({loading: false});
            throw error;
          }
        },

        setFromVerifiedBackup: instance => {
          set({instance});
        },

        getWalletSigner: async password => {
          const {instance} = get();
          set({loading: true});
          const signer = await wallet.decryptSigner(
            instance,
            password,
            instance.salt,
          );

          set({loading: false});
          return signer;
        },

        reencryptWalletSigner: async (password, newPassword) => {
          const {instance} = get();
          set({loading: true});

          try {
            const [signer, encryptedSigner] = await Promise.all([
              wallet.decryptSigner(instance, password, instance.salt),
              wallet.reencryptSigner(
                instance,
                password,
                newPassword,
                instance.salt,
              ),
            ]);
            if (!signer || !encryptedSigner) {
              set({loading: false});
              return;
            }
            console.log(encryptedSigner);

            const timestamp = Date.now();
            const signature = await signer.signMessage(
              `${encryptedSigner}${timestamp}`,
            );
            await axios.post(
              `${Env.BACKUP_URL}/v1/wallet/update/encrypted-signer`,
              {
                timestamp,
                signature,
                encryptedSigner,
                walletAddress: instance.walletAddress,
              },
            );

            set({loading: false, instance: {...instance, encryptedSigner}});
            return encryptedSigner;
          } catch (error) {
            set({loading: false});
            throw error;
          }
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

export const useWalletStoreAssetsSheetsSelector = () =>
  useWalletStore(state => ({instance: state.instance}));

export const useWalletStoreAssetsSelector = () =>
  useWalletStore(state => ({instance: state.instance}));

export const useWalletStoreSwapSelector = () =>
  useWalletStore(state => ({instance: state.instance}));

export const useWalletStoreSwapSheetsSelector = () =>
  useWalletStore(state => ({instance: state.instance}));

export const useWalletStorePasswordSelector = () =>
  useWalletStore(state => ({
    loading: state.loading,
    create: state.create,
  }));

export const useWalletStoreWalletImportSelector = () =>
  useWalletStore(state => ({
    loading: state.loading,
    pingBackup: state.pingBackup,
  }));

export const useWalletStoreMasterPasswordSelector = () =>
  useWalletStore(state => ({
    loading: state.loading,
    verifyEncryptedBackup: state.verifyEncryptedBackup,
  }));

export const useWalletStoreWalletRecoveredSelector = () =>
  useWalletStore(state => ({
    setFromVerifiedBackup: state.setFromVerifiedBackup,
  }));

export const useWalletStoreWalletConnectSheetsSelector = () =>
  useWalletStore(state => ({
    instance: state.instance,
  }));

export const useWalletStoreSecuritySheetsSelector = () =>
  useWalletStore(state => ({
    loading: state.loading,
    instance: state.instance,
    getWalletSigner: state.getWalletSigner,
    reencryptWalletSigner: state.reencryptWalletSigner,
  }));
