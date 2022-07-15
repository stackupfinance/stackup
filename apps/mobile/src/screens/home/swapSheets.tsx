import React, {useState, useMemo} from 'react';
import {useToast} from 'native-base';
import {constants} from '@stackupfinance/walletjs';
import {
  SwapSelectTokenSheet,
  SwapReviewOrderSheet,
  RequestMasterPassword,
} from '../../components';
import {
  useNavigationStoreSwapSheetsSelector,
  useExplorerStoreSwapSheetsSelector,
  useSwapStoreSwapSheetsSelector,
  useSettingsStoreSwapSheetsSelector,
  useWalletStoreSwapSheetsSelector,
  useBundlerStoreSwapSheetsSelector,
  useFingerprintStoreSwapSheetsSelector,
} from '../../state';
import {AppColors} from '../../config';
import {logEvent} from '../../utils/analytics';

export default function SwapSheets() {
  const toast = useToast();
  const {
    showSwapSelectTokenSheet,
    showSwapReviewOrderSheet,
    setShowSwapSelectTokenSheet,
    setShowSwapReviewOrderSheet,
  } = useNavigationStoreSwapSheetsSelector();
  const {currencies, walletStatus, fetchAddressOverview} =
    useExplorerStoreSwapSheetsSelector();
  const {data, clear: clearSwap, buildOps} = useSwapStoreSwapSheetsSelector();
  const {
    quoteCurrency: defaultCurrency,
    network,
    timePeriod,
  } = useSettingsStoreSwapSheetsSelector();
  const {instance} = useWalletStoreSwapSheetsSelector();
  const {
    loading: bundlerLoading,
    requestPaymasterSignature,
    verifyUserOperationsWithPaymaster,
    signUserOperations,
    relayUserOperations,
    clear: clearBundler,
  } = useBundlerStoreSwapSheetsSelector();
  const {isEnabled: isFingerprintEnabled, getMasterPassword} =
    useFingerprintStoreSwapSheetsSelector();
  const [showRequestMasterPassword, setShowRequestMasterPassword] =
    useState(false);
  const [unsignedUserOperations, setUnsignedUserOperations] = useState<
    Array<constants.userOperations.IUserOperation>
  >([]);

  const currencyBalances = useMemo(
    () =>
      currencies.reduce((prev, curr) => {
        return {...prev, [curr.currency]: curr.balance};
      }, {}),
    [currencies],
  );

  const onRequestMasterPasswordClose = () => {
    clearBundler();
    setShowRequestMasterPassword(false);
  };

  const onSwapSelectTokenClose = () => {
    setShowSwapSelectTokenSheet(false);
  };

  const onSwapReviewOrderClose = () => {
    logEvent('SWAP_REVIEW_ORDER_CLOSE');
    setShowSwapReviewOrderSheet(false);
  };

  const onSwapPress = async () => {
    const userOps = buildOps(
      instance,
      network,
      defaultCurrency,
      walletStatus.isDeployed,
      walletStatus.nonce,
    );
    const userOpsWithPaymaster = await requestPaymasterSignature(
      userOps,
      network,
    );
    if (!verifyUserOperationsWithPaymaster(userOps, userOpsWithPaymaster)) {
      toast.show({
        title: 'Transaction corrupted, contact us for help',
        backgroundColor: AppColors.singletons.warning,
        placement: 'bottom',
      });
      clearBundler();
      return;
    }
    setUnsignedUserOperations(userOpsWithPaymaster);

    if (isFingerprintEnabled) {
      const masterPassword = await getMasterPassword();
      masterPassword
        ? onConfirmTransaction(userOpsWithPaymaster)(masterPassword)
        : clearBundler();
    } else {
      setShowRequestMasterPassword(true);
    }
  };

  const onConfirmTransaction =
    (ops: Array<constants.userOperations.IUserOperation>) =>
    async (masterPassword: string) => {
      setShowRequestMasterPassword(false);
      const signedUserOps = await signUserOperations(
        instance,
        masterPassword,
        network,
        ops,
      );
      if (!signedUserOps) {
        toast.show({
          title: 'Incorrect password',
          backgroundColor: AppColors.singletons.warning,
          placement: 'top',
        });
        clearBundler();
        return;
      }

      logEvent('SWAP_CONFIRM');
      toast.show({
        title: 'Transaction sent, this might take a minute...',
        backgroundColor: AppColors.palettes.primary[600],
        placement: 'bottom',
      });
      relayUserOperations(signedUserOps, network, status => {
        switch (status) {
          case 'PENDING':
            toast.show({
              title: 'Transaction still pending, refresh later',
              backgroundColor: AppColors.palettes.primary[600],
              placement: 'bottom',
            });
            break;

          case 'FAIL':
            toast.show({
              title: 'Transaction failed, contact us for help',
              backgroundColor: AppColors.singletons.warning,
              placement: 'bottom',
            });
            fetchAddressOverview(
              network,
              defaultCurrency,
              timePeriod,
              instance.walletAddress,
            );
            break;

          default:
            toast.show({
              title: 'Transaction completed!',
              backgroundColor: AppColors.singletons.good,
              placement: 'bottom',
            });
            fetchAddressOverview(
              network,
              defaultCurrency,
              timePeriod,
              instance.walletAddress,
            );
            break;
        }

        clearSwap();
        setShowSwapReviewOrderSheet(false);
      });
    };

  return (
    <>
      <RequestMasterPassword
        isOpen={showRequestMasterPassword}
        onClose={onRequestMasterPasswordClose}
        onConfirm={onConfirmTransaction(unsignedUserOperations)}
      />

      <SwapSelectTokenSheet
        isOpen={showSwapSelectTokenSheet.value}
        onClose={onSwapSelectTokenClose}
        onChange={showSwapSelectTokenSheet.onChange}
        currencyList={currencies.map(({currency, balance}) => ({
          currency,
          balance,
        }))}
      />

      <SwapReviewOrderSheet
        isOpen={showSwapReviewOrderSheet}
        isLoading={bundlerLoading}
        onClose={onSwapReviewOrderClose}
        defaultCurrency={defaultCurrency}
        baseCurrency={data.baseCurrency}
        quoteCurrency={data.quoteCurrency}
        baseCurrencyValue={data.baseCurrencyValue}
        quoteCurrencyValue={data.quoteCurrencyValue}
        quote={data.quote}
        status={data.status}
        currencyBalances={currencyBalances}
        onSwap={onSwapPress}
      />
    </>
  );
}
