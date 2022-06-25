/* eslint-disable react/no-unstable-nested-components */
import React, {useEffect, useMemo} from 'react';
import {Linking} from 'react-native';
import {Box, Text} from 'native-base';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faWallet} from '@fortawesome/free-solid-svg-icons/faWallet';
import {faRocket} from '@fortawesome/free-solid-svg-icons/faRocket';
import {faArrowRightArrowLeft} from '@fortawesome/free-solid-svg-icons/faArrowRightArrowLeft';
import {faBolt} from '@fortawesome/free-solid-svg-icons/faBolt';
import {BigNumberish} from 'ethers';
import {HomeTabParamList, externalLinks, CurrencySymbols} from '../../config';
import AssetsScreen from './assets';
// import EarnScreen from './earn';
// import SwapScreen from './swap';
// import ActivityScreen from './activity';
import {
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
} from '../../state';

const Tab = createMaterialTopTabNavigator<HomeTabParamList>();

export const HomeScreen = () => {
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
    network,
    quoteCurrency,
    toggleCurrency,
  } = useSettingsStoreHomeSelector();
  const {walletStatus, currencies} = useExplorerStoreHomeSelector();
  const removeWallet = useRemoveWallet();
  const {
    loading: sendUserOpsLoading,
    data: sendData,
    update: updateSendData,
    clear: clearSendData,
    buildOps: buildSendOps,
  } = useSendUserOperation();

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
        quoteCurrency,
        walletStatus.isDeployed,
        walletStatus.nonce,
      )),
    });
    setShowSendSummarySheet(true);
  };

  const onFromWalletBackPress = () => {
    setShowDepositSheet(true);
  };

  const onSendBackPress = () => {
    clearSendData('toAddress');
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
        onClose={onCloseSendSummarySheet}
        onBack={onSendSummaryBackPress}
        fromAddress={instance.walletAddress}
        toAddress={sendData.toAddress}
        value={sendData.value}
        fee={sendData.fee}
        currency={sendData.currency}
        currencyBalances={currencyBalances}
        network={network}
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
