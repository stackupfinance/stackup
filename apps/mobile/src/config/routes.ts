import {NavigatorScreenParams} from '@react-navigation/native';

export type RootStackParamList = {
  Home: undefined;
  Security: undefined;
  Settings: undefined;
  Onboard: undefined;
  Example: undefined;
};

export type HomeTabParamList = {
  Assets: NavigatorScreenParams<RootStackParamList>;
  Earn: undefined;
  Swap: undefined;
  History: undefined;
};

export type SecurityStackParamList = {
  Overview: undefined;
};

export type SettingsStackParamList = {
  Overview: undefined;
};

export type OnboardStackParamList = {
  CreateWallet: undefined;
};

export type ExampleStackParamList = {
  DoThings: undefined;
};
