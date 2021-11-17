import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { isExpired } from 'react-jwt';
import { useAccountStore, accountUseAuthSelector } from '../state';
import { Routes } from '../config';

const REFRESH_INTERVAL_MS = 300000; // 5 minutes
const initAuthRoutes = new Set([Routes.LOGIN, Routes.SIGN_UP]);

export const useAuth = () => {
  const router = useRouter();
  const { accessToken, refreshToken, logout, refresh, enableAccount } =
    useAccountStore(accountUseAuthSelector);

  const isLoggedOut = () => !refreshToken;
  const refreshTokenExpired = () => isExpired(refreshToken?.token);
  const accessTokenExpired = () => isExpired(accessToken?.token);
  const notOnLoginOrSignUpPage = () => !initAuthRoutes.has(location.pathname);
  const onLoginPage = () => location.pathname === Routes.LOGIN;
  const shouldRefresh = () => accessToken && refreshToken && !isExpired(refreshToken.token);

  useEffect(() => {
    const authCheck = async () => {
      if (isLoggedOut()) {
        notOnLoginOrSignUpPage() && router.push(Routes.LOGIN);
      } else if (refreshTokenExpired()) {
        await logout();
        notOnLoginOrSignUpPage() && router.push(Routes.LOGIN);
      } else {
        accessTokenExpired() && (await refresh());
        onLoginPage() && router.push(Routes.HOME);
      }
    };

    authCheck().then(enableAccount);
  }, [refreshToken]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (shouldRefresh()) {
        refresh();
      }
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [accessToken, refreshToken]);
};
