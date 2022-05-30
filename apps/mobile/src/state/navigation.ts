import create from 'zustand';
import {devtools} from 'zustand/middleware';
import {NavigationState as InitialNavigationState} from '@react-navigation/native';

interface NavigationState {
  initialNavigationState: InitialNavigationState | undefined;
  showSettingsSheet: boolean;
  showSecuritySheet: boolean;

  setInitialNavigationState: (
    state: InitialNavigationState | undefined,
  ) => void;
  setShowSettingsSheet: (value: boolean) => void;
  toggleSecuritySheet: () => void;
  clear: () => void;
}

const STORE_NAME = 'stackup-navigation-store';
const useNavigationStore = create<NavigationState>()(
  devtools(
    (set, get) => ({
      initialNavigationState: undefined,
      showSettingsSheet: false,
      showSecuritySheet: false,

      setInitialNavigationState: state => {
        set({
          initialNavigationState: state,
          showSettingsSheet: false,
          showSecuritySheet: false,
        });
      },

      setShowSettingsSheet: value => {
        set({showSettingsSheet: value});
      },

      toggleSecuritySheet: () => {
        set({showSecuritySheet: !get().showSecuritySheet});
      },

      clear: () => {
        set({
          initialNavigationState: undefined,
          showSettingsSheet: false,
          showSecuritySheet: false,
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
    setShowSettingsSheet: state.setShowSettingsSheet,
  }));

export const useNavigationStoreAssetsSelector = () =>
  useNavigationStore(state => ({
    setShowSettingsSheet: state.setShowSettingsSheet,
  }));
