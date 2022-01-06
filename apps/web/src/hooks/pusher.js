import { useEffect } from 'react';
import Pusher from 'pusher-js';
import { useAccountStore, accountPusherSelector } from '../state';
import { App } from '../config';
import { types } from '../utils/events';

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
    channel.bind(types.newPayment, (data) => callback(types.newPayment, data));
    channel.bind(types.recoverAccount, (data) => callback(types.recoverAccount, data));

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
    channel.bind(types.recoverAccount, callback);

    return () => {
      pusher.disconnect();
    };
  }, []);
};
