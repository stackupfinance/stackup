import { useEffect, useState } from 'react';
import { useIntercom } from 'react-use-intercom';
import { useAccountStore, accountIntercomManagerSelector } from '../state';

export const IntercomManager = ({ children }) => {
  const { accessToken, user } = useAccountStore(accountIntercomManagerSelector);
  const { boot, update, shutdown } = useIntercom();
  const [shouldBoot, setShouldBoot] = useState(true);

  useEffect(() => {
    if (accessToken) {
      if (shouldBoot) {
        boot();
        setShouldBoot(false);
      }
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
