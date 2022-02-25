import { useEffect } from 'react';
import { useIntercom } from 'react-use-intercom';
import { useAccountStore, accountIntercomManagerSelector } from '../state';

export const IntercomManager = ({ children }) => {
  const { accessToken, user } = useAccountStore(accountIntercomManagerSelector);
  const { boot, shutdown } = useIntercom();

  useEffect(() => {
    if (accessToken) {
      shutdown();
      boot({
        name: user.username,
        userId: user.id,
        userHash: user.intercomHmacHash,
      });
    } else {
      shutdown();
      boot();
    }
  }, [accessToken]);

  return <>{children}</>;
};
