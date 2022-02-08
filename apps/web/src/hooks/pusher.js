import { useEffect } from 'react';
import Pusher from 'pusher-js';
import { useAccountStore, accountPusherSelector } from '../state';
import { App } from '../config';
import { txType } from '../utils/transaction';

export const useAuthChannel = (callback = () => {}) => {
  const { enabled, accessToken, user } = useAccountStore(accountPusherSelector);

  useEffect(() => {
    if (!enabled || !accessToken || !user) return;

    const pusher = new Pusher(App.pusher.appKey, {
      cluster: App.pusher.appCluster,
      authEndpoint: `${App.stackup.backendUrl}/v1/auth/pusher`,
      auth: { headers: { Authorization: `Bearer ${accessToken?.token}` } },
    });
    const channelName = `private-${user.id}-activity`;
    const channel = pusher.subscribe(channelName);
    channel.bind(txType.genericRelay, (data) => callback(txType.genericRelay, data));
    channel.bind(txType.newPayment, (data) => callback(txType.newPayment, data));
    channel.bind(txType.recoverAccount, (data) => callback(txType.recoverAccount, data));

    return () => {
      pusher.disconnect();
    };
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
