import Config from 'react-native-config';

interface AppEnvironment {
  EXPLORER_URL: string;
  AMPLITUDE_API_KEY: string;
  SENTRY_DSN: string;
}

export const Env: AppEnvironment = {
  EXPLORER_URL: Config.STACKUP_MOBILE_EXPLORER_URL,
  AMPLITUDE_API_KEY: Config.STACKUP_MOBILE_AMPLITUDE_API_KEY,
  SENTRY_DSN: Config.STACKUP_MOBILE_AMPLITUDE_API_KEY,
};
