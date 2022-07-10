import {Platform} from 'react-native';
import create from 'zustand';
import {devtools} from 'zustand/middleware';
import Intercom from '@intercom/intercom-react-native';
import {Env} from '../config';

interface IntercomState {
  debounceAndroidAppState: boolean;

  setDebounceAndroidAppState: (value: boolean) => void;
  identify: (walletAddress: string) => void;
  openMessenger: () => void;

  clear: () => void;
}

const STORE_NAME = 'stackup-intercom-store';
const useIntercomStore = create<IntercomState>()(
  devtools(
    (set, get) => ({
      debounceAndroidAppState: false,

      setDebounceAndroidAppState: debounceAndroidAppState => {
        if (Platform.OS === 'android') {
          set({debounceAndroidAppState});
        }
      },

      identify: walletAddress => {
        Env.INTERCOM_APP_ID &&
          Intercom.registerIdentifiedUser({userId: walletAddress});
      },

      openMessenger: () => {
        Intercom.displayMessenger().then(get().setDebounceAndroidAppState);
      },

      clear: () => {
        Env.INTERCOM_APP_ID && Intercom.logout();
        set({debounceAndroidAppState: false});
      },
    }),
    {name: STORE_NAME},
  ),
);

export const useIntercomStoreRemoveWalletSelector = () =>
  useIntercomStore(state => ({clear: state.clear}));

export const useIntercomStoreAuthSelector = () =>
  useIntercomStore(state => ({
    identify: state.identify,
    debounceAndroidAppState: state.debounceAndroidAppState,
    setDebounceAndroidAppState: state.setDebounceAndroidAppState,
  }));

export const useIntercomStoreAssetsSheetsSelector = () =>
  useIntercomStore(state => ({openMessenger: state.openMessenger}));

export const useIntercomStoreWalletImportSelector = () =>
  useIntercomStore(state => ({openMessenger: state.openMessenger}));

export const useIntercomStoreMasterPasswordSelector = () =>
  useIntercomStore(state => ({openMessenger: state.openMessenger}));
