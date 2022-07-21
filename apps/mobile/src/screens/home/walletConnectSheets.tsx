import React, {useEffect, useState, useMemo} from 'react';
import {useToast} from 'native-base';
import {
  AppColors,
  EthSendTransactionPayload,
  PersonalSignPayload,
  PaymasterStatus,
  GasEstimate,
} from '../../config';
import {
  RequestMasterPassword,
  WalletConnectSessionRequestSheet,
  WalletConnectSignSheet,
  WalletConnectTransactionSheet,
} from '../../components';
import {
  useNavigationStoreWalletConnectSheetsSelector,
  useWalletConnectStoreWalletConnectSheetsSelector,
  useFingerprintStoreWalletConnectSheetsSelector,
  useWalletStoreWalletConnectSheetsSelector,
  useBundlerStoreWalletConnectSheetsSelector,
  useSettingsStoreWalletConnectSheetsSelector,
  useExplorerStoreWalletConnectSheetsSelector,
} from '../../state';
import {logEvent} from '../../utils/analytics';

export default function WalletConnectSheets() {
  const toast = useToast();
  const {
    showWalletConnectSessionRequestSheet,
    showWalletConnectSignSheet,
    showWalletConnectTransactionSheet,
    setShowWalletConnectSessionRequestSheet,
    setShowWalletConnectSignSheet,
    setShowWalletConnectTransactionSheet,
  } = useNavigationStoreWalletConnectSheetsSelector();
  const {
    loading: walletConnectLoading,
    sessionRequest,
    callRequest,
    approveSessionRequest,
    approveCallRequest,
    signMessage,
    buildEthSendTransactionOps,
  } = useWalletConnectStoreWalletConnectSheetsSelector();
  const {
    loading: fingerprintLoading,
    isEnabled: isFingerprintEnabled,
    getMasterPassword,
  } = useFingerprintStoreWalletConnectSheetsSelector();
  const {instance} = useWalletStoreWalletConnectSheetsSelector();
  const {
    loading: bundlerLoading,
    fetchPaymasterStatus,
    requestPaymasterSignature,
    verifyUserOperationsWithPaymaster,
    signUserOperations,
    relayUserOperations,
    clear: clearBundler,
  } = useBundlerStoreWalletConnectSheetsSelector();
  const {
    network,
    quoteCurrency: defaultCurrency,
    timePeriod,
  } = useSettingsStoreWalletConnectSheetsSelector();
  const {
    loading: explorerLoading,
    currencies,
    walletStatus,
    fetchGasEstimate,
    fetchAddressOverview,
  } = useExplorerStoreWalletConnectSheetsSelector();
  const [showRequestMasterPassword, setShowRequestMasterPassword] =
    useState<boolean>(false);
  const [transactionData, setTransactionData] = useState<{
    paymasterStatus: PaymasterStatus;
    gasEstimate: GasEstimate;
  } | null>(null);

  const currencyBalances = useMemo(
    () =>
      currencies.reduce((prev, curr) => {
        return {...prev, [curr.currency]: curr.balance};
      }, {}),
    [currencies],
  );

  const isLoading =
    fingerprintLoading ||
    walletConnectLoading ||
    bundlerLoading ||
    explorerLoading;
  const [, sessionRequestPayload] = sessionRequest ?? [undefined, undefined];
  const [connector, payload] = callRequest ?? [undefined, undefined];

  useEffect(() => {
    if (payload) {
      switch (payload.method) {
        case 'eth_sendTransaction':
          fetchTransactionData();
          setShowWalletConnectTransactionSheet(true);
          break;
        case 'personal_sign':
          setShowWalletConnectSignSheet(true);
          break;
        default:
          toast.show({
            title: 'Request not supported.',
            backgroundColor: AppColors.singletons.medium,
            placement: 'top',
          });
          approveCallRequest(false);
          break;
      }
    }
  }, [callRequest]);

  const fetchTransactionData = async () => {
    const [paymasterStatus, gasEstimate] = await Promise.all([
      fetchPaymasterStatus(instance.walletAddress, network),
      fetchGasEstimate(network),
    ]);
    setTransactionData({paymasterStatus, gasEstimate});
  };

  const onRejectSessionRequest = () => {
    logEvent('WALLET_CONNECT_REJECT_SESSION', {
      appName: sessionRequestPayload?.params[0]?.peerMeta.name,
    });
    setShowWalletConnectSessionRequestSheet(false);
    approveSessionRequest(network, instance.walletAddress, false);
  };

  const onApproveSessionRequest = () => {
    logEvent('WALLET_CONNECT_APPROVE_SESSION', {
      appName: sessionRequestPayload?.params[0]?.peerMeta.name,
    });
    setShowWalletConnectSessionRequestSheet(false);
    approveSessionRequest(network, instance.walletAddress, true);
  };

  const onRejectCallRequest = () => {
    logEvent('WALLET_CONNECT_REJECT_CALL_REQUEST', {
      appName: connector?.peerMeta?.name,
      method: payload?.method,
    });
    approveCallRequest(false);

    setShowRequestMasterPassword(false);
    setShowWalletConnectSignSheet(false);
    setShowWalletConnectTransactionSheet(false);
    setTransactionData(null);
    clearBundler();
  };

  const onApproveCallRequest = async () => {
    if (isFingerprintEnabled) {
      const masterPassword = await getMasterPassword();
      masterPassword
        ? confirmCallRequest(masterPassword)
        : onRejectCallRequest();
    } else {
      setShowRequestMasterPassword(true);
    }
  };

  const confirmCallRequest = async (masterPassword: string) => {
    setShowRequestMasterPassword(false);

    if (payload) {
      switch (payload.method) {
        case 'eth_sendTransaction': {
          await submitEthSendTransaction(payload, masterPassword);
          logEvent('WALLET_CONNECT_APPROVE_CALL_REQUEST', {
            appName: connector.peerMeta?.name,
            method: payload.method,
          });
          break;
        }
        case 'personal_sign': {
          await submitPersonalSign(payload, masterPassword);
          logEvent('WALLET_CONNECT_APPROVE_CALL_REQUEST', {
            appName: connector.peerMeta?.name,
            method: payload.method,
          });
          break;
        }
        default: {
          onRejectCallRequest();
          break;
        }
      }
    }
  };

  const submitEthSendTransaction = async (
    transactionPayload: EthSendTransactionPayload,
    masterPassword: string,
  ) => {
    if (!transactionData) {
      onRejectCallRequest();
      return;
    }
    const {paymasterStatus, gasEstimate} = transactionData;

    const userOps = buildEthSendTransactionOps(
      instance,
      network,
      defaultCurrency,
      walletStatus,
      paymasterStatus,
      gasEstimate,
      transactionPayload,
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
      onRejectCallRequest();
      return;
    }

    const signedUserOps = await signUserOperations(
      instance,
      masterPassword,
      network,
      userOpsWithPaymaster,
    );
    if (!signedUserOps) {
      toast.show({
        title: 'Incorrect password',
        backgroundColor: AppColors.singletons.warning,
        placement: 'top',
      });
      onRejectCallRequest();
      return;
    }

    toast.show({
      title: 'Transaction sent, this might take a minute...',
      backgroundColor: AppColors.palettes.primary[600],
      placement: 'bottom',
    });
    relayUserOperations(signedUserOps, network, (status, hash) => {
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

      approveCallRequest(true, hash);
      setShowWalletConnectTransactionSheet(false);
      setTransactionData(null);
    });
  };

  const submitPersonalSign = async (
    signPayload: PersonalSignPayload,
    masterPassword: string,
  ) => {
    const result = await signMessage(
      instance,
      masterPassword,
      signPayload.params[0],
    );
    if (!result) {
      toast.show({
        title: 'Incorrect password',
        backgroundColor: AppColors.singletons.warning,
        placement: 'top',
      });
      onRejectCallRequest();
      return;
    }

    approveCallRequest(true, result);
    setShowWalletConnectSignSheet(false);
  };

  return (
    <>
      <RequestMasterPassword
        isOpen={showRequestMasterPassword}
        onClose={onRejectCallRequest}
        onConfirm={confirmCallRequest}
      />

      <WalletConnectSessionRequestSheet
        isOpen={showWalletConnectSessionRequestSheet || sessionRequest !== null}
        onClose={onRejectSessionRequest}
        onApprove={onApproveSessionRequest}
        payload={sessionRequestPayload}
      />

      <WalletConnectTransactionSheet
        isOpen={showWalletConnectTransactionSheet}
        isLoading={isLoading}
        onClose={onRejectCallRequest}
        onApprove={onApproveCallRequest}
        defaultCurrency={defaultCurrency}
        currencyBalances={currencyBalances}
        paymasterStatus={transactionData?.paymasterStatus}
        connector={connector}
        payload={payload}
      />

      <WalletConnectSignSheet
        isOpen={showWalletConnectSignSheet}
        isLoading={isLoading}
        onClose={onRejectCallRequest}
        onApprove={onApproveCallRequest}
        connector={connector}
        payload={payload}
      />
    </>
  );
}
