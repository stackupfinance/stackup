/* eslint-disable react/no-unstable-nested-components */
import React, {useEffect, useState} from 'react';
import {Text} from 'native-base';
import {NavigationState} from '@react-navigation/native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faWallet} from '@fortawesome/free-solid-svg-icons/faWallet';
import {faRocket} from '@fortawesome/free-solid-svg-icons/faRocket';
import {faArrowRightArrowLeft} from '@fortawesome/free-solid-svg-icons/faArrowRightArrowLeft';
import {faBolt} from '@fortawesome/free-solid-svg-icons/faBolt';
import {HomeTabParamList} from '../../config';
import AssetsScreen from './assets';
import AssetsSheetsScreen from './assetsSheets';
// import EarnScreen from './earn';
import SwapScreen from './swap';
import SwapSheets from './swapSheets';
import SecuritySheets from './securitySheets';
import WalletConnectSheets from './walletConnectSheets';
// import ActivityScreen from './activity';
import {
  useNavigationStoreHomeSelector,
  useSwapStoreHomeSelector,
} from '../../state';

const Tab = createMaterialTopTabNavigator<HomeTabParamList>();

export const HomeScreen = () => {
  const {resetAllSheets} = useNavigationStoreHomeSelector();
  const {clear: clearSwap} = useSwapStoreHomeSelector();
  const [routeName, setRouteName] = useState<keyof HomeTabParamList>('Assets');

  useEffect(() => {
    resetAllSheets();
    clearSwap();

    return () => {
      resetAllSheets();
    };
  }, [resetAllSheets, clearSwap, routeName]);

  const renderSheets = () => {
    switch (routeName) {
      case 'Assets':
        return (
          <>
            <AssetsSheetsScreen />
            <SecuritySheets />
          </>
        );

      case 'Swap':
        return <SwapSheets />;

      default:
        return;
    }
  };

  return (
    <>
      <Tab.Navigator
        tabBarPosition="bottom"
        screenListeners={{
          state: event => {
            if (!event.data) {
              return;
            }
            const {state} = event.data as {
              state: NavigationState<HomeTabParamList>;
            };
            setRouteName(state.routeNames[state.index]);
          },
        }}
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
        {/* <Tab.Screen name="Earn" component={EarnScreen} /> */}
        <Tab.Screen name="Swap" component={SwapScreen} />
        {/* <Tab.Screen name="Activity" component={ActivityScreen} /> */}
      </Tab.Navigator>

      {renderSheets()}

      <WalletConnectSheets />
    </>
  );
};
