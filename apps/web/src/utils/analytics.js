import amplitude from 'amplitude-js';
import { App } from '../config';
import { isClient } from './environment';

const analyticsURL = new URL(`${App.stackup.backendUrl}/proxy/analytics`);
isClient() &&
  amplitude.getInstance().init(App.amplitude.apiKey, null, {
    apiEndpoint: `${analyticsURL.host}${analyticsURL.pathname}`,
    forceHttps: process.env.NODE_ENV === 'production',
  });

export const EVENTS = {
  LOGIN: 'LOGIN',
  SIGN_UP_START: 'SIGN_UP_START',
  SIGN_UP_FINISH: 'SIGN_UP_FINISH',
  ENTER_FROM_WELCOME: 'ENTER_FROM_WELCOME',
  ONBOARD_OPEN_SKIP: 'ONBOARD_OPEN_SKIP',
  ONBOARD_CONFIRM_SKIP: 'ONBOARD_CONFIRM_SKIP',
  ONBOARD_ADD_EMAIL: 'ONBOARD_ADD_EMAIL',
  ONBOARD_SEND_CODE: 'ONBOARD_SEND_CODE',
  ONBOARD_VERIFY_EMAIL: 'ONBOARD_VERIFY_EMAIL',
  ONBOARD_CONFIRM_SETUP: 'ONBOARD_CONFIRM_SETUP',
  LOGOUT: 'LOGOUT',
  SEARCH_START: 'SEARCH_START',
  SEARCH_CLEAR: 'SEARCH_CLEAR',
  GO_TO_SEARCH_RESULT: 'GO_TO_SEARCH_RESULT',
  GOT_TO_ACTIVITY_ITEM: 'GOT_TO_ACTIVITY_ITEM',
  OPEN_PAY: 'OPEN_PAY',
  SEND_PAY: 'SEND_PAY',
  CONFIRM_PAY: 'CONFIRM_PAY',
};

export const logEvent = (event) => {
  amplitude.getInstance().logEvent(event);
};
