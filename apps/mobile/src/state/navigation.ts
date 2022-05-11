import create from 'zustand';
import {devtools} from 'zustand/middleware';
import {NavigationState as InitialNavigationState} from '@react-navigation/native';

interface NavigationState {
  initialNavigationState: InitialNavigationState | undefined;

  setInitialNavigationState: (
    state: InitialNavigationState | undefined,
  ) => void;
  clear: () => void;
}

const STORE_NAME = 'stackup-navigation-store';
const useNavigationStore = create<NavigationState>()(
  devtools(
    set => ({
      initialNavigationState: undefined,

      setInitialNavigationState: state => {
        set({initialNavigationState: state});
      },

      clear: () => {
        set({
          initialNavigationState: undefined,
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
