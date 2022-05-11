import create from 'zustand';
import {devtools} from 'zustand/middleware';
import {HomeTabParamList} from '../config';

interface NavigationState {
  initialHomeRoute: keyof HomeTabParamList | undefined;

  setInitialHomeRoute: (route: keyof HomeTabParamList) => void;
  clear: () => void;
}

const STORE_NAME = 'stackup-navigation-store';
const useNavigationStore = create<NavigationState>()(
  devtools(
    set => ({
      initialHomeRoute: undefined,

      setInitialHomeRoute: (route: keyof HomeTabParamList) => {
        set({initialHomeRoute: route});
      },

      clear: () => {
        set({initialHomeRoute: undefined});
      },
    }),
    {name: STORE_NAME},
  ),
);

export const useNavigationStoreRemoveWalletSelector = () =>
  useNavigationStore(state => ({clear: state.clear}));

export const useNavigationStoreHomeSelector = () =>
  useNavigationStore(state => ({
    initialHomeRoute: state.initialHomeRoute,
    setInitialHomeRoute: state.setInitialHomeRoute,
  }));
