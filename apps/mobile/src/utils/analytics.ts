import {Amplitude} from '@amplitude/react-native';
import {Env} from '../config';

type Events = {
  CREATE_WALLET: {enableFingerprint: boolean};
  REMOVE_WALLET: undefined;
};

const ampInstance = Amplitude.getInstance();
ampInstance.init(Env.AMPLITUDE_API_KEY);

export function logEvent<E extends keyof Events, P extends Events[E]>(
  event: E,
  properties?: P,
) {
  ampInstance.logEvent(event, properties);
}
