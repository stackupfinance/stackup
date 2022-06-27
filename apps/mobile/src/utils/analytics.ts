import {Amplitude} from '@amplitude/react-native';
import {Env} from '../config';

type Events = {
  BACK_PRESS_FROM_WALLET: undefined;
  CHANGE_CURRENCY_SETTING: {token: string; enabled: boolean};
  CLOSE_DEPOSIT_SHEET: undefined;
  CLOSE_FROM_WALLET_SHEET: undefined;
  CLOSE_SETTINGS: undefined;
  CLOSE_TOKEN_LIST: undefined;
  CREATE_WALLET: {enableFingerprint: boolean};
  DEPOSIT: undefined;
  HELP_AND_SUPPORT: undefined;
  JOIN_DISCORD: undefined;
  MANAGE_CURRENCY_LIST: undefined;
  NAVIGATE_SECURITY: undefined;
  OPEN_SETTINGS: undefined;
  REMOVE_WALLET: undefined;
  SEND: undefined;
  TRANSFER_FROM_WALLET: undefined;
};

const ampInstance = Amplitude.getInstance();
ampInstance.init(Env.AMPLITUDE_API_KEY);

export function logEvent<E extends keyof Events, P extends Events[E]>(
  event: E,
  properties?: P,
) {
  ampInstance.logEvent(event, properties);
}
