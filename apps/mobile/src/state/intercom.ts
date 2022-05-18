import {Platform} from 'react-native';
import create from 'zustand';
import {devtools} from 'zustand/middleware';
import Intercom from '@intercom/intercom-react-native';

interface IntercomState {
  debounceAndroidAppState: boolean;

  identify: (walletAddress: string) => void;
  setDebounceAndroidAppState: (value: boolean) => void;
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
        Intercom.registerIdentifiedUser({userId: walletAddress});
      },

      openMessenger: () => {
        Intercom.displayMessenger().then(get().setDebounceAndroidAppState);
      },

      clear: () => {
        Intercom.logout();
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

export const useIntercomStoreSettingsSelector = () =>
  useIntercomStore(state => ({openMessenger: state.openMessenger}));
