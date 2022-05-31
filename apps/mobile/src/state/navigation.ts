import create from 'zustand';
import {devtools} from 'zustand/middleware';
import {NavigationState as InitialNavigationState} from '@react-navigation/native';

interface Sheets {
  showSettingsSheet: boolean;
  showTokenListSheet: boolean;
  showDepositSheet: boolean;
  showFromWalletSheet: boolean;
}

interface NavigationState extends Sheets {
  initialNavigationState: InitialNavigationState | undefined;

  setInitialNavigationState: (
    state: InitialNavigationState | undefined,
  ) => void;
  setShowSettingsSheet: (value: boolean) => void;
  setShowTokenListSheet: (value: boolean) => void;
  setShowDepositSheet: (value: boolean) => void;
  setShowFromWalletSheet: (value: boolean) => void;
  resetAllSheets: () => void;
  clear: () => void;
}

const sheetDefaults: Sheets = {
  showSettingsSheet: false,
  showTokenListSheet: false,
  showDepositSheet: false,
  showFromWalletSheet: false,
};
const STORE_NAME = 'stackup-navigation-store';
const useNavigationStore = create<NavigationState>()(
  devtools(
    set => ({
      initialNavigationState: undefined,
      ...sheetDefaults,

      setInitialNavigationState: state => {
        set({
          initialNavigationState: state,
          ...sheetDefaults,
        });
      },

      setShowSettingsSheet: value => {
        set({...sheetDefaults, showSettingsSheet: value});
      },

      setShowTokenListSheet: value => {
        set({...sheetDefaults, showTokenListSheet: value});
      },

      setShowDepositSheet: value => {
        set({...sheetDefaults, showDepositSheet: value});
      },

      setShowFromWalletSheet: value => {
        set({...sheetDefaults, showFromWalletSheet: value});
      },

      resetAllSheets: () => {
        set({...sheetDefaults});
      },

      clear: () => {
        set({
          initialNavigationState: undefined,
          ...sheetDefaults,
        });
      },
    }),
    {name: STORE_NAME},
  ),
);

export const useNavigationStoreRemoveWalletSelector = () =>
  useNavigationStore(state => ({clear: state.clear}));

export const useNavigationStoreAppSelector = () =>
  useNavigationStore(state => ({
    initialNavigationState: state.initialNavigationState,
    setInitialNavigationState: state.setInitialNavigationState,
  }));

export const useNavigationStoreHomeSelector = () =>
  useNavigationStore(state => ({
    showSettingsSheet: state.showSettingsSheet,
    showTokenListSheet: state.showTokenListSheet,
    showDepositSheet: state.showDepositSheet,
    showFromWalletSheet: state.showFromWalletSheet,
    setShowSettingsSheet: state.setShowSettingsSheet,
    setShowTokenListSheet: state.setShowTokenListSheet,
    setShowDepositSheet: state.setShowDepositSheet,
    setShowFromWalletSheet: state.setShowFromWalletSheet,
    resetAllSheets: state.resetAllSheets,
  }));

export const useNavigationStoreAssetsSelector = () =>
  useNavigationStore(state => ({
    setShowSettingsSheet: state.setShowSettingsSheet,
    setShowTokenListSheet: state.setShowTokenListSheet,
    setShowDepositSheet: state.setShowDepositSheet,
  }));
