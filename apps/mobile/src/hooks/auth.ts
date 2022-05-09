import {useEffect, useState} from 'react';
import {
  useWalletStoreRemoveWalletSelector,
  useWalletStoreAuthSelector,
} from '../state';

interface UseAuthHook {
  isReady: boolean;
  isAuthenticated: boolean;
}
type UseRemoveWalletHook = () => Promise<void>;

export const useRemoveWallet = (): UseRemoveWalletHook => {
  const {remove} = useWalletStoreRemoveWalletSelector();

  return async () => {
    // Clear all state here before removing wallet from device.
    await remove();
  };
};

export const useAuth = (): UseAuthHook => {
  const {instance, hasHydrated} = useWalletStoreAuthSelector();
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    if (hasHydrated) {
      setIsAuthenticated(Boolean(instance));
      setIsReady(true);
    }
  }, [hasHydrated, instance]);

  return {
    isReady,
    isAuthenticated,
  };
};
