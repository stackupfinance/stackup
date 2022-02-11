import create from 'zustand';
import Pusher from 'pusher-js';
import { App } from '../config';
import { txType } from '../utils/transaction';

export const pusherUseAuthSelector = (state) => ({
  clear: state.clear,
});

export const pusherPusherSelector = (state) => ({
  updateAuthenticatedPusher: state.updateAuthenticatedPusher,
  removeCallback: state.removeCallback,
});

const defaultState = {
  callbacks: {},
  accessTokenUsed: undefined,
  pusherSingleton: undefined,
};

const initPusher = (userId, accessToken, get) => {
  const exec = (txType) => (data) => {
    Object.values(get().callbacks).forEach((cb) => cb(txType, data));
  };

  const pusher = new Pusher(App.pusher.appKey, {
    cluster: App.pusher.appCluster,
    authEndpoint: `${App.stackup.backendUrl}/v1/auth/pusher`,
    auth: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const channel = pusher.subscribe(`private-${userId}-activity`);
  channel.bind(txType.genericRelay, exec(txType.genericRelay));
  channel.bind(txType.newPayment, exec(txType.newPayment));
  channel.bind(txType.recoverAccount, exec(txType.recoverAccount));

  return pusher;
};

export const usePusherStore = create((set, get) => ({
  ...defaultState,

  updateAuthenticatedPusher: (userId, accessToken, callbackId, callback) => {
    if (!userId || !accessToken) return;

    let pusherSingleton = get().pusherSingleton;
    if (!pusherSingleton) {
      pusherSingleton = initPusher(userId, accessToken, get);
    } else if (accessToken !== get().accessTokenUsed) {
      pusherSingleton.disconnect();
      pusherSingleton = initPusher(userId, accessToken, get);
    }

    set({
      pusherSingleton,
      accessTokenUsed: accessToken,
      callbacks: { ...get().callbacks, [callbackId]: callback },
    });
  },

  removeCallback: (id) => {
    const { [id]: _cb, ...callbacks } = get().callbacks;
    if (Object.keys(callbacks ?? {}).length === 0) {
      get().pusherSingleton?.disconnect();
      set({ callbacks: {}, pusherSingleton: undefined });
    } else {
      set({ callbacks });
    }
  },

  clear: () => {
    get().pusherSingleton?.disconnect();
    set({ ...defaultState });
  },
}));
