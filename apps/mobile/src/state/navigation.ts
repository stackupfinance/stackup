import create from 'zustand';
import {devtools} from 'zustand/middleware';
import {NavigationState as InitialNavigationState} from '@react-navigation/native';
import {CurrencySymbols} from '../config';

interface Sheets {
  showSettingsSheet: boolean;
  showTokenListSheet: boolean;
  showDepositSheet: boolean;
  showSelectCurrencySheet: boolean;
  showSendSheet: boolean;
  showSendSummarySheet: boolean;
  showFromWalletSheet: boolean;
  showPasswordSheet: boolean;
  showVerifyEmailSheet: boolean;
  showEmailSheet: boolean;
  showEmailConfirmedSheet: boolean;
  showSwapSelectToken: {
    value: boolean;
    onChange: (currency: CurrencySymbols) => void;
  };
}

interface NavigationState extends Sheets {
  initialNavigationState: InitialNavigationState | undefined;

  setInitialNavigationState: (
    state: InitialNavigationState | undefined,
  ) => void;
  setShowSettingsSheet: (value: boolean) => void;
  setShowTokenListSheet: (value: boolean) => void;
  setShowDepositSheet: (value: boolean) => void;
  setShowSelectCurrencySheet: (value: boolean) => void;
  setShowSendSheet: (value: boolean) => void;
  setShowSendSummarySheet: (value: boolean) => void;
  setShowFromWalletSheet: (value: boolean) => void;
  setShowPasswordSheet: (value: boolean) => void;
  setShowEmailSheet: (value: boolean) => void;
  setShowVerifyEmailSheet: (value: boolean) => void;
  setShowEmailConfirmedSheet: (value: boolean) => void;
  setShowSwapSelectToken: (
    value: boolean,
    onChange?: (currency: CurrencySymbols) => void,
  ) => void;
  resetAllSheets: () => void;
  clear: () => void;
}

const sheetDefaults: Sheets = {
  showSettingsSheet: false,
  showTokenListSheet: false,
  showDepositSheet: false,
  showSelectCurrencySheet: false,
  showSendSheet: false,
  showSendSummarySheet: false,
  showFromWalletSheet: false,
  showPasswordSheet: false,
  showEmailSheet: false,
  showVerifyEmailSheet: false,
  showEmailConfirmedSheet: false,
  showSwapSelectToken: {value: false, onChange: () => {}},
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

      setShowSelectCurrencySheet: value => {
        set({...sheetDefaults, showSelectCurrencySheet: value});
      },

      setShowSendSheet: value => {
        set({...sheetDefaults, showSendSheet: value});
      },

      setShowSendSummarySheet: value => {
        set({...sheetDefaults, showSendSummarySheet: value});
      },

      setShowFromWalletSheet: value => {
        set({...sheetDefaults, showFromWalletSheet: value});
      },

      setShowPasswordSheet: value => {
        set({...sheetDefaults, showPasswordSheet: value});
      },

      setShowEmailSheet: value => {
        set({...sheetDefaults, showEmailSheet: value});
      },

      setShowVerifyEmailSheet: value => {
        set({...sheetDefaults, showVerifyEmailSheet: value});
      },

      setShowEmailConfirmedSheet: value => {
        set({...sheetDefaults, showEmailConfirmedSheet: value});
      },

      setShowSwapSelectToken: (value, onChange = () => {}) => {
        set({...sheetDefaults, showSwapSelectToken: {value, onChange}});
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
    resetAllSheets: state.resetAllSheets,
  }));

export const useNavigationStoreAssetsSelector = () =>
  useNavigationStore(state => ({
    setShowSettingsSheet: state.setShowSettingsSheet,
    setShowTokenListSheet: state.setShowTokenListSheet,
    setShowDepositSheet: state.setShowDepositSheet,
    setShowSelectCurrencySheet: state.setShowSelectCurrencySheet,
  }));

export const useNavigationStoreSecuritySelector = () =>
  useNavigationStore(state => ({
    showPasswordSheet: state.showPasswordSheet,
    showEmailSheet: state.showEmailSheet,
    showVerifyEmailSheet: state.showVerifyEmailSheet,
    showEmailConfirmedSheet: state.showEmailConfirmedSheet,
    setShowPasswordSheet: state.setShowPasswordSheet,
    setShowEmailSheet: state.setShowEmailSheet,
    setShowVerifyEmailSheet: state.setShowVerifyEmailSheet,
    setShowEmailConfirmedSheet: state.setShowEmailConfirmedSheet,
    resetAllSheets: state.resetAllSheets,
  }));

export const useNavigationStoreSecurityOverviewSelector = () =>
  useNavigationStore(state => ({
    setShowPasswordSheet: state.setShowPasswordSheet,
    setshowEmailSheet: state.setShowEmailSheet,
  }));

export const useNavigationStoreSwapSelector = () =>
  useNavigationStore(state => ({
    setShowSwapSelectToken: state.setShowSwapSelectToken,
  }));

export const useNavigationStoreAssetsSheetsSelector = () =>
  useNavigationStore(state => ({
    showSettingsSheet: state.showSettingsSheet,
    showTokenListSheet: state.showTokenListSheet,
    showDepositSheet: state.showDepositSheet,
    showSelectCurrencySheet: state.showSelectCurrencySheet,
    showSendSheet: state.showSendSheet,
    showSendSummarySheet: state.showSendSummarySheet,
    showFromWalletSheet: state.showFromWalletSheet,
    setShowSettingsSheet: state.setShowSettingsSheet,
    setShowTokenListSheet: state.setShowTokenListSheet,
    setShowDepositSheet: state.setShowDepositSheet,
    setShowSelectCurrencySheet: state.setShowSelectCurrencySheet,
    setShowSendSheet: state.setShowSendSheet,
    setShowSendSummarySheet: state.setShowSendSummarySheet,
    setShowFromWalletSheet: state.setShowFromWalletSheet,
  }));

export const useNavigationStoreSwapSheetsSelector = () =>
  useNavigationStore(state => ({
    showSwapSelectToken: state.showSwapSelectToken,
    setShowSwapSelectToken: state.setShowSwapSelectToken,
  }));
