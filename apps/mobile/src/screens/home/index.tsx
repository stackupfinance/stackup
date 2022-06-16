/* eslint-disable react/no-unstable-nested-components */
import React, {useEffect} from 'react';
import {Linking} from 'react-native';
import {Box, Text} from 'native-base';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faWallet} from '@fortawesome/free-solid-svg-icons/faWallet';
import {faRocket} from '@fortawesome/free-solid-svg-icons/faRocket';
import {faArrowRightArrowLeft} from '@fortawesome/free-solid-svg-icons/faArrowRightArrowLeft';
import {faBolt} from '@fortawesome/free-solid-svg-icons/faBolt';
import {HomeTabParamList, externalLinks} from '../../config';
import AssetsScreen from './assets';
// import EarnScreen from './earn';
// import SwapScreen from './swap';
// import ActivityScreen from './activity';
import {
  SettingsSheet,
  TokenListSheet,
  DepositSheet,
  FromWalletSheet,
} from '../../components';
import {useRemoveWallet} from '../../hooks';
import {
  useNavigationStoreHomeSelector,
  useIntercomStoreHomeSelector,
  useWalletStoreHomeSelector,
} from '../../state';

const Tab = createMaterialTopTabNavigator<HomeTabParamList>();

export const HomeScreen = () => {
  const {
    showSettingsSheet,
    showTokenListSheet,
    showDepositSheet,
    showFromWalletSheet,
    setShowSettingsSheet,
    setShowTokenListSheet,
    setShowDepositSheet,
    setShowFromWalletSheet,
    resetAllSheets,
  } = useNavigationStoreHomeSelector();
  const {instance} = useWalletStoreHomeSelector();
  const {openMessenger} = useIntercomStoreHomeSelector();
  const removeWallet = useRemoveWallet();

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

  const onFromWalletBackPress = () => {
    setShowDepositSheet(true);
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
        onTokenChange={(currency, enabled) => console.log(currency, enabled)}
        tokenSettings={[
          {currency: 'USDC', balance: '10000000000', enabled: true},
          {currency: 'ETH', balance: '1860000000000000000', enabled: true},
          {currency: 'MATIC', balance: '6240000000000000000', enabled: true},
        ]}
      />

      <DepositSheet
        isOpen={showDepositSheet}
        onClose={onCloseDepositSheet}
        onTransferFromWalletPress={onTransferFromWalletPress}
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
