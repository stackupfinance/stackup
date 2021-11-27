import amplitude from 'amplitude-js';
import { App } from '../config';
import { isClient } from './environment';

const analyticsURL = new URL(`${App.stackup.backendUrl}/analytics`);
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
