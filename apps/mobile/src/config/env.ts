import Config from 'react-native-config';

interface AppEnvironment {
  EXPLORER_URL: string;
  BACKUP_URL: string;
  AMPLITUDE_API_KEY: string;
  SENTRY_DSN: string;
  INTERCOM_APP_ID: string;
}

export const Env: AppEnvironment = {
  EXPLORER_URL: Config.STACKUP_MOBILE_EXPLORER_URL,
  BACKUP_URL: Config.STACKUP_MOBILE_BACKUP_URL,
  AMPLITUDE_API_KEY: Config.STACKUP_MOBILE_AMPLITUDE_API_KEY,
  SENTRY_DSN: Config.STACKUP_MOBILE_AMPLITUDE_API_KEY,
  INTERCOM_APP_ID: Config.STACKUP_MOBILE_INTERCOM_APP_ID,
};
