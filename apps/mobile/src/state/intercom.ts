import create from 'zustand';
import {devtools} from 'zustand/middleware';
import Intercom from '@intercom/intercom-react-native';

interface IntercomState {
  inMessenger: boolean;

  identify: (walletAddress: string) => void;
  setInMessenger: (value: boolean) => void;
  openMessenger: () => void;

  clear: () => void;
}

const STORE_NAME = 'stackup-intercom-store';
const useIntercomStore = create<IntercomState>()(
  devtools(
    set => ({
      inMessenger: false,

      setInMessenger: inMessenger => {
        set({inMessenger});
      },

      identify: walletAddress => {
        Intercom.registerIdentifiedUser({userId: walletAddress});
      },

      openMessenger: () => {
        Intercom.displayMessenger();
        set({inMessenger: true});
      },

      clear: () => {
        Intercom.logout();
        set({inMessenger: false});
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
    inMessenger: state.inMessenger,
    setInMessenger: state.setInMessenger,
  }));

export const useIntercomStoreSettingsSelector = () =>
  useIntercomStore(state => ({openMessenger: state.openMessenger}));
