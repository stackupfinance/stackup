import {Amplitude} from '@amplitude/react-native';
import {STACKUP_MOBILE_AMPLITUDE_API_KEY} from '@env';

type Events = {
  CREATE_WALLET: {enableFingerprint: boolean};
  REMOVE_WALLET: undefined;
};

const ampInstance = Amplitude.getInstance();
ampInstance.init(STACKUP_MOBILE_AMPLITUDE_API_KEY);

export function logEvent<E extends keyof Events, P extends Events[E]>(
  event: E,
  properties?: P,
) {
  console.log(STACKUP_MOBILE_AMPLITUDE_API_KEY);
  ampInstance.logEvent(event, properties);
}
