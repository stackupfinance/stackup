import create from 'zustand';
import {devtools} from 'zustand/middleware';
import {NavigationState as InitialNavigationState} from '@react-navigation/native';

interface NavigationState {
  initialNavigationState: InitialNavigationState | undefined;
  showSettingsSheet: boolean;
  showTokenListSheet: boolean;

  setInitialNavigationState: (
    state: InitialNavigationState | undefined,
  ) => void;
  setShowSettingsSheet: (value: boolean) => void;
  setShowTokenListSheet: (value: boolean) => void;
  resetAllSheets: () => void;
  clear: () => void;
}

const STORE_NAME = 'stackup-navigation-store';
const useNavigationStore = create<NavigationState>()(
  devtools(
    set => ({
      initialNavigationState: undefined,
      showSettingsSheet: false,
      showTokenListSheet: false,

      setInitialNavigationState: state => {
        set({
          initialNavigationState: state,
          showSettingsSheet: false,
          showTokenListSheet: false,
        });
      },

      setShowSettingsSheet: value => {
        set({showSettingsSheet: value, showTokenListSheet: false});
      },

      setShowTokenListSheet: value => {
        set({showSettingsSheet: false, showTokenListSheet: value});
      },

      resetAllSheets: () => {
        set({showSettingsSheet: false, showTokenListSheet: false});
      },

      clear: () => {
        set({
          initialNavigationState: undefined,
          showSettingsSheet: false,
          showTokenListSheet: false,
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
    setShowSettingsSheet: state.setShowSettingsSheet,
    setShowTokenListSheet: state.setShowTokenListSheet,
    resetAllSheets: state.resetAllSheets,
  }));

export const useNavigationStoreAssetsSelector = () =>
  useNavigationStore(state => ({
    setShowSettingsSheet: state.setShowSettingsSheet,
    setShowTokenListSheet: state.setShowTokenListSheet,
  }));
