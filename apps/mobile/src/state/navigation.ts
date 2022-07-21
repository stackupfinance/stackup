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
  showSwapSelectTokenSheet: {
    value: boolean;
    onChange: (currency: CurrencySymbols) => void;
  };
  showSwapReviewOrderSheet: boolean;
  showQRCodeSheet: boolean;
  showWalletConnectSessionRequestSheet: boolean;
  showWalletConnectSignSheet: boolean;
  showWalletConnectTransactionSheet: boolean;
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
  setShowSwapSelectTokenSheet: (
    value: boolean,
    onChange?: (currency: CurrencySymbols) => void | Promise<void>,
  ) => void;
  setShowSwapReviewOrderSheet: (value: boolean) => void;
  setShowQRCodeSheet: (value: boolean) => void;
  setShowWalletConnectSessionRequestSheet: (value: boolean) => void;
  setShowWalletConnectSignSheet: (value: boolean) => void;
  setShowWalletConnectTransactionSheet: (value: boolean) => void;
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
  showSwapSelectTokenSheet: {value: false, onChange: () => {}},
  showSwapReviewOrderSheet: false,
  showQRCodeSheet: false,
  showWalletConnectSessionRequestSheet: false,
  showWalletConnectSignSheet: false,
  showWalletConnectTransactionSheet: false,
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

      setShowSwapSelectTokenSheet: (value, onChange = () => {}) => {
        set({...sheetDefaults, showSwapSelectTokenSheet: {value, onChange}});
      },

      setShowSwapReviewOrderSheet: value => {
        set({...sheetDefaults, showSwapReviewOrderSheet: value});
      },

      setShowQRCodeSheet: value => {
        set({...sheetDefaults, showQRCodeSheet: value});
      },

      setShowWalletConnectSessionRequestSheet: value => {
        set({...sheetDefaults, showWalletConnectSessionRequestSheet: value});
      },

      setShowWalletConnectSignSheet: value => {
        set({...sheetDefaults, showWalletConnectSignSheet: value});
      },

      setShowWalletConnectTransactionSheet: value => {
        set({...sheetDefaults, showWalletConnectTransactionSheet: value});
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
    setShowQRCodeSheet: state.setShowQRCodeSheet,
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
    setShowSwapSelectTokenSheet: state.setShowSwapSelectTokenSheet,
    setShowSwapReviewOrderSheet: state.setShowSwapReviewOrderSheet,
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
    showQRCodeSheet: state.showQRCodeSheet,
    showWalletConnectSessionRequestSheet:
      state.showWalletConnectSessionRequestSheet,
    setShowSettingsSheet: state.setShowSettingsSheet,
    setShowTokenListSheet: state.setShowTokenListSheet,
    setShowDepositSheet: state.setShowDepositSheet,
    setShowSelectCurrencySheet: state.setShowSelectCurrencySheet,
    setShowSendSheet: state.setShowSendSheet,
    setShowSendSummarySheet: state.setShowSendSummarySheet,
    setShowFromWalletSheet: state.setShowFromWalletSheet,
    setShowQRCodeSheet: state.setShowQRCodeSheet,
    setShowWalletConnectSessionRequestSheet:
      state.setShowWalletConnectSessionRequestSheet,
  }));

export const useNavigationStoreSwapSheetsSelector = () =>
  useNavigationStore(state => ({
    showSwapSelectTokenSheet: state.showSwapSelectTokenSheet,
    showSwapReviewOrderSheet: state.showSwapReviewOrderSheet,
    setShowSwapSelectTokenSheet: state.setShowSwapSelectTokenSheet,
    setShowSwapReviewOrderSheet: state.setShowSwapReviewOrderSheet,
  }));

export const useNavigationStoreWalletConnectSheetsSelector = () =>
  useNavigationStore(state => ({
    showWalletConnectSignSheet: state.showWalletConnectSignSheet,
    showWalletConnectTransactionSheet: state.showWalletConnectTransactionSheet,
    setShowWalletConnectSignSheet: state.setShowWalletConnectSignSheet,
    setShowWalletConnectTransactionSheet:
      state.setShowWalletConnectTransactionSheet,
  }));
