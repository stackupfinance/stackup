import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';
import { nanoid } from 'nanoid';
import {
  useAccountStore,
  accountPusherSelector,
  usePusherStore,
  pusherPusherSelector,
} from '../state';
import { App } from '../config';
import { txType } from '../utils/transaction';

export const useAuthChannel = (callback = () => {}) => {
  const { enabled, accessToken, user } = useAccountStore(accountPusherSelector);
  const { updateAuthenticatedPusher, removeCallback } = usePusherStore(pusherPusherSelector);
  const [callbackId] = useState(nanoid(6));

  useEffect(() => {
    if (!enabled || !accessToken || !user) {
      removeCallback(callbackId);
      return;
    }
    updateAuthenticatedPusher(user.id, accessToken.token, callbackId, callback);
    return () => removeCallback(callbackId);
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
