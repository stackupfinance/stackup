import {useEffect, useState} from 'react';
import {isExpired} from 'react-jwt';
import {useAuthStoreLogoutSelector, useAuthStoreAuthSelector} from '../state';

interface UseAuthHook {
  isReady: boolean;
  isAuthenticated: boolean;
}
type UseLogoutHook = () => Promise<void>;

const REFRESH_INTERVAL_MS = 300000; // 5 minutes

export const useLogout = (): UseLogoutHook => {
  const {logout} = useAuthStoreLogoutSelector();

  return async () => {
    // Clear all state here before logout.
    await logout();
  };
};

export const useAuth = (): UseAuthHook => {
  const logout = useLogout();
  const {accessToken, refreshToken, refresh, hasHydrated} =
    useAuthStoreAuthSelector();
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const isNotAuthenticated = !refreshToken || isExpired(refreshToken);
  const isInitialCheck = !isReady;
  const shouldRefresh = accessToken && refreshToken && !isExpired(refreshToken);

  useEffect(() => {
    if (hasHydrated) {
      const authCheck = async () => {
        if (isNotAuthenticated) {
          await logout();
          setIsAuthenticated(false);
        } else {
          isInitialCheck && (await refresh());
          setIsAuthenticated(true);
        }

        setIsReady(true);
      };

      authCheck();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, refreshToken]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (shouldRefresh) {
        await refresh();
      }
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, refreshToken]);

  return {
    isReady,
    isAuthenticated,
  };
};
