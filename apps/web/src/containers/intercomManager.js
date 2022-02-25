import { useEffect, useState } from 'react';
import { useIntercom } from 'react-use-intercom';
import { useAccountStore, accountIntercomManagerSelector } from '../state';

export const IntercomManager = ({ children }) => {
  const { accessToken, user } = useAccountStore(accountIntercomManagerSelector);
  const { boot, update, shutdown } = useIntercom();
  const [shouldBootWithAuth, setShouldBootWithAuth] = useState(true);

  useEffect(() => {
    if (accessToken) {
      if (shouldBootWithAuth) {
        boot({
          name: user.username,
          userId: user.id,
          userHash: user.intercomHmacHash,
        });
        setShouldBootWithAuth(false);
      } else {
        update({
          name: user.username,
          userId: user.id,
          userHash: user.intercomHmacHash,
        });
      }
    } else {
      shutdown();
      boot();
      setShouldBootWithAuth(false);
    }
  }, [accessToken]);

  return <>{children}</>;
};
