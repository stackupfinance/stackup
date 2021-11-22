import { useEffect } from 'react';
import Pusher from 'pusher-js';
import { useAccountStore, accountPusherSelector } from '../state';
import { App } from '../config';

export const useActivityChannel = (callback = () => {}) => {
  const { enabled, accessToken, user } = useAccountStore(accountPusherSelector);

  useEffect(() => {
    if (!enabled || !accessToken || !user) return;

    const pusher = new Pusher(App.pusher.appKey, {
      cluster: App.pusher.appCluster,
      authEndpoint: `${App.stackup.backendUrl}/v1/auth/pusher`,
      auth: { headers: { Authorization: `Bearer ${accessToken?.token}` } },
    });
    const channelName = `private-${user.id}-activity`;
    const eventName = 'newPayment';
    const channel = pusher.subscribe(channelName);
    channel.bind(eventName, callback);

    return () => {
      pusher.disconnect();
    };
  }, [enabled, accessToken, user]);
};
