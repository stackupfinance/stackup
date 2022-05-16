import {useEffect, useState, useRef} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import {
  useWalletStoreRemoveWalletSelector,
  useWalletStoreAuthSelector,
  useFingerprintStoreAuthSelector,
  useFingerprintStoreRemoveWalletSelector,
  useNavigationStoreRemoveWalletSelector,
} from '../state';
import {logEvent} from '../utils/analytics';

interface UseAuthHook {
  isReady: boolean;
  hasWalletInstance: boolean;
}
interface AppStateDelta {
  prev: AppStateStatus;
  curr: AppStateStatus;
}
type UseRemoveWalletHook = () => Promise<void>;

export const useRemoveWallet = (): UseRemoveWalletHook => {
  const {remove} = useWalletStoreRemoveWalletSelector();
  const {resetMasterPassword} = useFingerprintStoreRemoveWalletSelector();
  const {clear: clearNavigation} = useNavigationStoreRemoveWalletSelector();

  return async () => {
    // Clear all state here before removing wallet from device.
    clearNavigation();
    await resetMasterPassword();
    remove();
    logEvent('REMOVE_WALLET');
  };
};

export const useAuth = (): UseAuthHook => {
  const {instance, hasHydrated: walletHydrated} = useWalletStoreAuthSelector();
  const {
    isEnabled: isFingerprintEnabled,
    checkDevice,
    getMasterPassword,
    hasHydrated: fingerprintHydrated,
  } = useFingerprintStoreAuthSelector();
  const [isReady, setIsReady] = useState<boolean>(false);
  const [hasWalletInstance, setHasWalletInstance] = useState<boolean>(false);
  const [appStateDelta, setAppStateDelta] = useState<AppStateDelta>({
    prev: AppState.currentState,
    curr: AppState.currentState,
  });
  const isFingerprintEnabledRef = useRef<boolean>(isFingerprintEnabled);
  const hasWalletInstanceRef = useRef<boolean>(hasWalletInstance);
  const appStateDeltaRef = useRef<AppStateDelta>(appStateDelta);

  const hasHydrated = walletHydrated && fingerprintHydrated;
  isFingerprintEnabledRef.current = isFingerprintEnabled;
  hasWalletInstanceRef.current = hasWalletInstance;
  appStateDeltaRef.current = appStateDelta;

  const showUnlockPrompt = async () => {
    setIsReady(false);

    setTimeout(async () => {
      try {
        await getMasterPassword();
        setIsReady(true);
      } catch (_error) {
        showUnlockPrompt();
      }
    });
  };

  useEffect(() => {
    if (hasHydrated) {
      checkDevice();
      setHasWalletInstance(Boolean(instance));
      setIsReady(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, instance]);

  useEffect(() => {
    const listener = AppState.addEventListener('change', async state => {
      const delta: AppStateDelta = {
        prev: appStateDeltaRef.current.curr,
        curr: state,
      };

      if (
        hasWalletInstanceRef.current &&
        isFingerprintEnabledRef.current &&
        delta.prev === 'background' &&
        delta.curr === 'active'
      ) {
        showUnlockPrompt();
      }

      setAppStateDelta(delta);
    });

    return listener.remove;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isReady,
    hasWalletInstance,
  };
};
