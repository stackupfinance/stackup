/* eslint-disable react/no-unstable-nested-components */
import React, {useEffect, useMemo, useState} from 'react';
import {Linking} from 'react-native';
import {Box, Text, useToast} from 'native-base';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faWallet} from '@fortawesome/free-solid-svg-icons/faWallet';
import {faRocket} from '@fortawesome/free-solid-svg-icons/faRocket';
import {faArrowRightArrowLeft} from '@fortawesome/free-solid-svg-icons/faArrowRightArrowLeft';
import {faBolt} from '@fortawesome/free-solid-svg-icons/faBolt';
import {BigNumberish} from 'ethers';
import {
  HomeTabParamList,
  externalLinks,
  CurrencySymbols,
  AppColors,
} from '../../config';
import AssetsScreen from './assets';
// import EarnScreen from './earn';
// import SwapScreen from './swap';
// import ActivityScreen from './activity';
import {
  RequestMasterPassword,
  SettingsSheet,
  TokenListSheet,
  DepositSheet,
  SelectCurrencySheet,
  SendSheet,
  SendSummarySheet,
  FromWalletSheet,
} from '../../components';
import {useRemoveWallet, useSendUserOperation} from '../../hooks';
import {
  useNavigationStoreHomeSelector,
  useIntercomStoreHomeSelector,
  useWalletStoreHomeSelector,
  useSettingsStoreHomeSelector,
  useExplorerStoreHomeSelector,
  useBundlerStoreHomeSelector,
  useFingerprintStoreHomeSelector,
} from '../../state';
import {constants} from '@stackupfinance/walletjs/build/types';

const Tab = createMaterialTopTabNavigator<HomeTabParamList>();

export const HomeScreen = () => {
  const toast = useToast();
  const {
    showSettingsSheet,
    showTokenListSheet,
    showDepositSheet,
    showSelectCurrencySheet,
    showSendSheet,
    showSendSummarySheet,
    showFromWalletSheet,
    setShowSettingsSheet,
    setShowTokenListSheet,
    setShowDepositSheet,
    setShowSelectCurrencySheet,
    setShowSendSheet,
    setShowSendSummarySheet,
    setShowFromWalletSheet,
    resetAllSheets,
  } = useNavigationStoreHomeSelector();
  const {instance} = useWalletStoreHomeSelector();
  const {openMessenger} = useIntercomStoreHomeSelector();
  const {
    currencies: enabledCurrencies,
    timePeriod,
    network,
    quoteCurrency,
    toggleCurrency,
  } = useSettingsStoreHomeSelector();
  const {walletStatus, currencies, fetchAddressOverview} =
    useExplorerStoreHomeSelector();
  const {
    loading: sendUserOpsLoading,
    requestPaymasterSignature,
    verifyUserOperationsWithPaymaster,
    signUserOperations,
    relayUserOperations,
  } = useBundlerStoreHomeSelector();
  const {isEnabled: isFingerprintEnabled, getMasterPassword} =
    useFingerprintStoreHomeSelector();
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

  useEffect(() => {
    return () => {
      resetAllSheets();
    };
  }, [resetAllSheets]);

  const onRequestMasterPasswordClose = () => {
    setShowRequestMasterPassword(false);
  };

  const onCloseSettingsSheet = () => {
    setShowSettingsSheet(false);
  };

  const onCloseTokenListSheet = () => {
    setShowTokenListSheet(false);
  };

  const onCloseDepositSheet = () => {
    setShowDepositSheet(false);
  };

  const onCloseSelectCurrencySheet = () => {
    clearSendData();
    setShowSelectCurrencySheet(false);
  };

  const onCloseSendSheet = () => {
    clearSendData();
    setShowSendSheet(false);
  };

  const onCloseSendSummarySheet = () => {
    clearSendData();
    setShowSendSummarySheet(false);
  };

  const onCloseFromWalletSheet = () => {
    setShowFromWalletSheet(false);
  };

  const onHelpPress = () => {
    openMessenger();
  };

  const onDiscordPress = () => {
    Linking.openURL(externalLinks.discord);
  };

  const onRemoveWalletPress = () => {
    removeWallet();
  };

  const onTransferFromWalletPress = () => {
    setShowFromWalletSheet(true);
  };

  const onSelectCurrencyItem = (currency: CurrencySymbols) => {
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
      onConfirmTransaction(userOperations)(masterPassword ?? '');
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

        return;
      }

      toast.show({
        title: 'Transaction sent, this might take a minute',
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

  const onFromWalletBackPress = () => {
    setShowDepositSheet(true);
  };

  const onSendBackPress = () => {
    setShowSelectCurrencySheet(true);
  };

  const onSendSummaryBackPress = () => {
    setShowSendSheet(true);
  };

  return (
    <>
      <Tab.Navigator
        tabBarPosition="bottom"
        // TODO: Remove this when adding more tabs
        tabBar={() => <Box />}
        screenOptions={({route}) => ({
          tabBarLabel: ({color}) => {
            return (
              <Text fontFamily="heading" fontSize="9px" color={color}>
                {route.name}
              </Text>
            );
          },
          tabBarIcon: ({color}) => {
            let icon = faWallet;
            if (route.name === 'Earn') {
              icon = faRocket;
            } else if (route.name === 'Swap') {
              icon = faArrowRightArrowLeft;
            } else if (route.name === 'Activity') {
              icon = faBolt;
            }

            return <FontAwesomeIcon icon={icon} color={color} size={20} />;
          },
          tabBarIndicatorStyle: {top: 0},
          tabBarShowIcon: true,
          headerShown: false,
        })}>
        <Tab.Screen name="Assets" component={AssetsScreen} />
        {/* <Tab.Screen name="Earn" component={EarnScreen} />
        <Tab.Screen name="Swap" component={SwapScreen} />
        <Tab.Screen name="Activity" component={ActivityScreen} /> */}
      </Tab.Navigator>

      <RequestMasterPassword
        isOpen={showRequestMasterPassword}
        onClose={onRequestMasterPasswordClose}
        onConfirm={onConfirmTransaction(unsignedUserOperations)}
      />

      <SettingsSheet
        isOpen={showSettingsSheet}
        onClose={onCloseSettingsSheet}
        onHelpPress={onHelpPress}
        onDiscordPress={onDiscordPress}
        onRemoveWalletPress={onRemoveWalletPress}
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

      <FromWalletSheet
        network="Polygon"
        walletAddress={instance.walletAddress}
        isOpen={showFromWalletSheet}
        onBack={onFromWalletBackPress}
        onClose={onCloseFromWalletSheet}
      />
    </>
  );
};
