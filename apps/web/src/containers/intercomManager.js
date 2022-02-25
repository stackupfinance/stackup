import { useEffect } from 'react';
import { useIntercom } from 'react-use-intercom';
import { useAccountStore, accountIntercomManagerSelector } from '../state';

export const IntercomManager = ({ children }) => {
  const { accessToken, user } = useAccountStore(accountIntercomManagerSelector);
  const { boot, update, shutdown } = useIntercom();

  useEffect(() => {
    if (accessToken) {
      update({
        name: user.username,
        user_id: user.id,
        user_hash: user.intercomHmacHash,
      });
    } else {
      shutdown();
      boot();
    }
  }, [accessToken]);

  return <>{children}</>;
};
