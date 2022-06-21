import {NavigatorScreenParams} from '@react-navigation/native';
import {wallet} from '@stackupfinance/walletjs';

export type RootStackParamList = {
  Home: undefined;
  Security: undefined;
  Onboard: undefined;
};

export type HomeTabParamList = {
  Assets: NavigatorScreenParams<RootStackParamList>;
  Earn: undefined;
  Swap: undefined;
  Activity: undefined;
};

export type SecurityStackParamList = {
  Overview: undefined;
};

export type SettingsStackParamList = {
  Overview: undefined;
};

export type OnboardStackParamList = {
  Welcome: undefined;
  Password: {
    enableFingerprint: boolean;
  };
  WalletImport: {
    enableFingerprint: boolean;
  };
  MasterPassword: {
    enableFingerprint: boolean;
    walletAddress: string;
  };
  WalletRecovered: {
    enableFingerprint: boolean;
    password: string;
    instance: wallet.WalletInstance;
  };
};
