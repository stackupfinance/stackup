import {Amplitude} from '@amplitude/react-native';
import {Env, CurrencySymbols} from '../config';

type Events = {
  JOIN_DISCORD: {screen: string};
  OPEN_SUPPORT: {screen: string};

  WELCOME_CREATE: undefined;
  WELCOME_IMPORT: undefined;

  WALLET_IMPORT_CONTINUE: undefined;
  WALLET_IMPORT_BACK: undefined;

  MASTER_PASSWORD_CONTINUE: undefined;
  MASTER_PASSWORD_BACK: undefined;

  WALLET_RECOVERED_CONTINUE: undefined;
  WALLET_RECOVERED_BACK: undefined;

  PASSWORD_CREATE_WALLET: {enableFingerprint: boolean};
  PASSWORD_BACK: undefined;

  SETTINGS_OPEN: undefined;
  SETTINGS_CLOSE: undefined;
  SETTINGS_REMOVE_WALLET: undefined;

  DEPOSIT_OPEN: undefined;
  DEPOSIT_CLOSE: undefined;
  DEPOSIT_TRANSFER_FROM_WALLET: undefined;
  DEPOSIT_TRANSFER_FROM_WALLET_CLOSE: undefined;
  DEPOSIT_TRANSFER_FROM_WALLET_BACK: undefined;

  SEND_SELECT_CURRENCY_OPEN: undefined;
  SEND_SELECT_CURRENCY_CLOSE: undefined;
  SEND_SELECT_CURRENCY_ITEM: {currency: CurrencySymbols};
  SEND_VALUE_BACK: undefined;
  SEND_VALUE_CLOSE: undefined;
  SEND_VALUE_CONTINUE: undefined;
  SEND_SUMMARY_BACK: undefined;
  SEND_SUMMARY_CLOSE: undefined;
  SEND_SUMMARY_CONFIRM: undefined;

  MANAGE_CURRENCY_OPEN: undefined;
  MANAGE_CURRENCY_CLOSE: undefined;
  MANAGE_CURRENCY_ON_CHANGE: {currency: CurrencySymbols; enabled: boolean};
};

const ampInstance = Amplitude.getInstance();
ampInstance.init(Env.AMPLITUDE_API_KEY);

export function logEvent<E extends keyof Events, P extends Events[E]>(
  event: E,
  properties?: P,
) {
  ampInstance.logEvent(event, properties);
}
