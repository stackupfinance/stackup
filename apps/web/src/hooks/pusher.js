import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';
import { nanoid } from 'nanoid';
import { useAccountStore, accountPusherSelector } from '../state';
import { App } from '../config';
import { txType } from '../utils/transaction';

let pusherSingleton;
const callbacks = {};
const execCb = (txType, callbackId) => (data) => {
  callbacks[callbackId](txType, data);
};

export const useAuthChannel = (callback = () => {}) => {
  const { enabled, accessToken, user } = useAccountStore(accountPusherSelector);
  const [callbackId] = useState(nanoid(6));
  const disconnect = () => {
    delete callbacks[callbackId];
    if (Object.keys(callbacks).length === 0 && pusherSingleton) {
      pusherSingleton.disconnect();
      pusherSingleton = undefined;
    }
  };

  useEffect(() => {
    if (!enabled || !accessToken || !user) {
      disconnect();
      return;
    }
    if (!pusherSingleton) {
      pusherSingleton = new Pusher(App.pusher.appKey, {
        cluster: App.pusher.appCluster,
        authEndpoint: `${App.stackup.backendUrl}/v1/auth/pusher`,
        auth: { headers: { Authorization: `Bearer ${accessToken?.token}` } },
      });
    }
    if (!callbacks[callbackId]) {
      callbacks[callbackId] = callback;
    }

    const channelName = `private-${user.id}-activity`;
    const channel = pusherSingleton.subscribe(channelName);
    channel.bind(txType.genericRelay, execCb(txType.genericRelay, callbackId));
    channel.bind(txType.newPayment, execCb(txType.newPayment, callbackId));
    channel.bind(txType.recoverAccount, execCb(txType.recoverAccount, callbackId));

    return disconnect;
  }, [enabled, accessToken, user]);
};

export const useRecoverAccountChannel = (channelId, callback = () => {}) => {
  useEffect(() => {
    const pusher = new Pusher(App.pusher.appKey, {
      cluster: App.pusher.appCluster,
      authEndpoint: `${App.stackup.backendUrl}/v1/auth/pusher`,
    });

    const channelName = `recover-account-${channelId}`;
    const channel = pusher.subscribe(channelName);
    channel.bind(txType.recoverAccount, callback);

    return () => {
      pusher.disconnect();
    };
  }, []);
};
