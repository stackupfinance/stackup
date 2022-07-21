import React, {useMemo, useState} from 'react';
import {Linking} from 'react-native';
import {useToast} from 'native-base';
import {BigNumberish} from 'ethers';
import {constants} from '@stackupfinance/walletjs';
import {externalLinks, CurrencySymbols, AppColors} from '../../config';
import {
  RequestMasterPassword,
  SettingsSheet,
  TokenListSheet,
  DepositSheet,
  SelectCurrencySheet,
  SendSheet,
  SendSummarySheet,
  FromWalletSheet,
  QRCodeSheet,
} from '../../components';
import {useRemoveWallet, useSendUserOperation} from '../../hooks';
import {
  useNavigationStoreAssetsSheetsSelector,
  useIntercomStoreAssetsSheetsSelector,
  useWalletStoreAssetsSheetsSelector,
  useSettingsStoreAssetsSheetsSelector,
  useExplorerStoreAssetsSheetsSelector,
  useBundlerStoreAssetsSheetsSelector,
  useFingerprintStoreAssetsSheetsSelector,
  useRampStoreAssetsSheetsSelector,
  useWalletConnectStoreAssetsSheetsSelector,
} from '../../state';
import {isValid} from '../../utils/address';
import {isValidWalletConnectURI} from '../../utils/walletconnect';
import {logEvent} from '../../utils/analytics';

export default function AssetsSheetsScreen() {
  const toast = useToast();
  const {
    showSettingsSheet,
    showTokenListSheet,
    showDepositSheet,
    showSelectCurrencySheet,
    showSendSheet,
    showSendSummarySheet,
    showFromWalletSheet,
    showQRCodeSheet,
    setShowSettingsSheet,
    setShowTokenListSheet,
    setShowDepositSheet,
    setShowSelectCurrencySheet,
    setShowSendSheet,
    setShowSendSummarySheet,
    setShowFromWalletSheet,
    setShowQRCodeSheet,
    setShowWalletConnectSessionRequestSheet,
    setShowSecurityOverviewSheet,
  } = useNavigationStoreAssetsSheetsSelector();
  const {instance} = useWalletStoreAssetsSheetsSelector();
  const {openMessenger} = useIntercomStoreAssetsSheetsSelector();
  const {
    currencies: enabledCurrencies,
    timePeriod,
    network,
    quoteCurrency,
    toggleCurrency,
  } = useSettingsStoreAssetsSheetsSelector();
  const {walletStatus, currencies, fetchAddressOverview} =
    useExplorerStoreAssetsSheetsSelector();
  const {
    loading: sendUserOpsLoading,
    requestPaymasterSignature,
    verifyUserOperationsWithPaymaster,
    signUserOperations,
    relayUserOperations,
    clear: clearBundler,
  } = useBundlerStoreAssetsSheetsSelector();
  const {isEnabled: isFingerprintEnabled, getMasterPassword} =
    useFingerprintStoreAssetsSheetsSelector();
  const {openRamp} = useRampStoreAssetsSheetsSelector();
  const {connect} = useWalletConnectStoreAssetsSheetsSelector();
  const removeWallet = useRemoveWallet();
  const {
    data: sendData,
    update: updateSendData,
    clear: clearSendData,
    buildOps: buildSendOps,
  } = useSendUserOperation();
  const [showRequestMasterPassword, setShowRequestMasterPassword] =
    useState(false);
  const [unsignedUserOperations, setUnsignedUserOperations] = useState<
    Array<constants.userOperations.IUserOperation>
  >([]);

  const currencySet = useMemo(
    () => new Set(enabledCurrencies),
    [enabledCurrencies],
  );

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

  const onCloseSettingsSheet = () => {
    logEvent('SETTINGS_CLOSE');
    setShowSettingsSheet(false);
  };

  const onCloseQRCodeSheet = () => {
    logEvent('QR_CODE_CLOSE');
    setShowQRCodeSheet(false);
  };

  const onCloseTokenListSheet = () => {
    logEvent('MANAGE_CURRENCY_CLOSE');
    setShowTokenListSheet(false);
  };

  const onCloseDepositSheet = () => {
    logEvent('DEPOSIT_CLOSE');
    setShowDepositSheet(false);
  };

  const onCloseFromWalletSheet = () => {
    logEvent('DEPOSIT_TRANSFER_FROM_WALLET_CLOSE');
    setShowFromWalletSheet(false);
  };

  const onCloseSelectCurrencySheet = () => {
    logEvent('SEND_SELECT_CURRENCY_CLOSE');
    clearSendData();
    setShowSelectCurrencySheet(false);
  };

  const onCloseSendSheet = () => {
    logEvent('SEND_VALUE_CLOSE');
    clearSendData();
    setShowSendSheet(false);
  };

  const onCloseSendSummarySheet = () => {
    logEvent('SEND_SUMMARY_CLOSE');
    clearSendData();
    setShowSendSummarySheet(false);
  };

  const onSecurityPress = () => {
    setShowSecurityOverviewSheet(true);
  };

  const onHelpPress = () => {
    logEvent('OPEN_SUPPORT', {screen: 'Settings'});
    openMessenger();
  };

  const onDiscordPress = () => {
    logEvent('JOIN_DISCORD', {screen: 'Settings'});
    Linking.openURL(externalLinks.discord);
  };

  const onRemoveWalletPress = () => {
    logEvent('SETTINGS_REMOVE_WALLET');
    removeWallet();
  };

  const onTransferFromWalletPress = () => {
    logEvent('DEPOSIT_TRANSFER_FROM_WALLET');
    setShowFromWalletSheet(true);
  };

  const onDepositFromRampPress = () => {
    logEvent('DEPOSIT_FROM_RAMP');
    openRamp(instance.walletAddress);
  };

  const onSelectCurrencyItem = (currency: CurrencySymbols) => {
    logEvent('SEND_SELECT_CURRENCY_ITEM', {currency});
    updateSendData({currency});
    setShowSendSheet(true);
  };

  const onSendNextPress = async (toAddress: string, value: BigNumberish) => {
    updateSendData({
      toAddress,
      value,
      ...(await buildSendOps(
        instance,
        network,
        walletStatus.isDeployed,
        walletStatus.nonce,
        quoteCurrency,
        toAddress,
        value,
      )),
    });
    logEvent('SEND_VALUE_CONTINUE');
    setShowSendSummarySheet(true);
  };

  const onSendSummaryNextPress = async () => {
    const userOperations = await requestPaymasterSignature(
      sendData.userOperations,
      network,
    );
    setUnsignedUserOperations(userOperations);

    if (isFingerprintEnabled) {
      const masterPassword = await getMasterPassword();
      masterPassword
        ? onConfirmTransaction(userOperations)(masterPassword)
        : clearBundler();
    } else {
      setShowRequestMasterPassword(true);
    }
  };

  const onConfirmTransaction =
    (ops: Array<constants.userOperations.IUserOperation>) =>
    async (masterPassword: string) => {
      setShowRequestMasterPassword(false);
      if (!verifyUserOperationsWithPaymaster(sendData.userOperations, ops)) {
        toast.show({
          title: 'Transaction corrupted, contact us for help',
          backgroundColor: AppColors.singletons.warning,
          placement: 'bottom',
        });
        clearBundler();
        return;
      }

      const userOperations = await signUserOperations(
        instance,
        masterPassword,
        network,
        ops,
      );
      if (!userOperations) {
        toast.show({
          title: 'Incorrect password',
          backgroundColor: AppColors.singletons.warning,
          placement: 'top',
        });
        clearBundler();
        return;
      }

      logEvent('SEND_SUMMARY_CONFIRM');
      toast.show({
        title: 'Transaction sent, this might take a minute...',
        backgroundColor: AppColors.palettes.primary[600],
        placement: 'bottom',
      });
      relayUserOperations(userOperations, network, status => {
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
              quoteCurrency,
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
              quoteCurrency,
              timePeriod,
              instance.walletAddress,
            );
            break;
        }

        clearSendData();
        setShowSendSummarySheet(false);
      });
    };

  const onQRCodeDetected = (value: string) => {
    if (isValid(value)) {
      logEvent('QR_CODE_SCAN_ADDRESS');
      updateSendData({toAddress: value});
      setShowSelectCurrencySheet(true);
    } else if (isValidWalletConnectURI(value)) {
      logEvent('QR_CODE_SCAN_WALLET_CONNECT');
      connect(value);
      setShowWalletConnectSessionRequestSheet(true);
    } else {
      logEvent('QR_CODE_SCAN_UNSUPPORTED');
      toast.show({
        title: 'This code is not supported.',
        backgroundColor: AppColors.singletons.medium,
        placement: 'top',
      });
    }
  };

  const onFromWalletBackPress = () => {
    logEvent('DEPOSIT_TRANSFER_FROM_WALLET_BACK');
    setShowDepositSheet(true);
  };

  const onSendBackPress = () => {
    logEvent('SEND_VALUE_BACK');
    setShowSelectCurrencySheet(true);
  };

  const onSendSummaryBackPress = () => {
    logEvent('SEND_SUMMARY_BACK');
    setShowSendSheet(true);
  };

  return (
    <>
      <RequestMasterPassword
        isOpen={showRequestMasterPassword}
        onClose={onRequestMasterPasswordClose}
        onConfirm={onConfirmTransaction(unsignedUserOperations)}
      />

      <SettingsSheet
        isOpen={showSettingsSheet}
        onClose={onCloseSettingsSheet}
        onSecurityPress={onSecurityPress}
        onHelpPress={onHelpPress}
        onDiscordPress={onDiscordPress}
        onRemoveWalletPress={onRemoveWalletPress}
      />

      <QRCodeSheet
        isOpen={showQRCodeSheet}
        onClose={onCloseQRCodeSheet}
        network={network}
        onQRCodeDetected={onQRCodeDetected}
      />

      <TokenListSheet
        isOpen={showTokenListSheet}
        onClose={onCloseTokenListSheet}
        onTokenChange={toggleCurrency}
        tokenSettings={currencies.map(({currency, balance}) => ({
          currency,
          balance,
          enabled: currencySet.has(currency),
        }))}
      />

      <DepositSheet
        isOpen={showDepositSheet}
        onClose={onCloseDepositSheet}
        onTransferFromWalletPress={onTransferFromWalletPress}
        onDepositFromRampPress={onDepositFromRampPress}
      />

      <FromWalletSheet
        network={network}
        walletAddress={instance.walletAddress}
        isOpen={showFromWalletSheet}
        onBack={onFromWalletBackPress}
        onClose={onCloseFromWalletSheet}
      />

      <SelectCurrencySheet
        isOpen={showSelectCurrencySheet}
        onClose={onCloseSelectCurrencySheet}
        currencyList={currencies.map(({currency, balance}) => ({
          currency,
          balance,
        }))}
        onSelectCurrencyItem={onSelectCurrencyItem}
      />

      <SendSheet
        isOpen={showSendSheet}
        isLoading={sendUserOpsLoading}
        onClose={onCloseSendSheet}
        onBack={onSendBackPress}
        onNext={onSendNextPress}
        currency={sendData.currency}
        currencyBalances={currencyBalances}
        addressOverride={sendData.toAddress}
      />

      <SendSummarySheet
        isOpen={showSendSummarySheet}
        isLoading={sendUserOpsLoading}
        onClose={onCloseSendSummarySheet}
        onBack={onSendSummaryBackPress}
        fromAddress={instance.walletAddress}
        toAddress={sendData.toAddress}
        value={sendData.value}
        fee={sendData.fee}
        currency={sendData.currency}
        currencyBalances={currencyBalances}
        network={network}
        onNext={onSendSummaryNextPress}
      />
    </>
  );
}
