import * as React from 'react';
import {Text} from 'native-base';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faWallet} from '@fortawesome/free-solid-svg-icons/faWallet';
import {faRocket} from '@fortawesome/free-solid-svg-icons/faRocket';
import {faArrowRightArrowLeft} from '@fortawesome/free-solid-svg-icons/faArrowRightArrowLeft';
import {faBolt} from '@fortawesome/free-solid-svg-icons/faBolt';
import {HomeTabParamList} from '../../config';
import {useNavigationStoreHomeSelector} from '../../state';
import AssetsScreen from './assets';
import EarnScreen from './earn';
import SwapScreen from './swap';
import HistoryScreen from './history';

const Tab = createMaterialTopTabNavigator<HomeTabParamList>();

export const HomeScreen = () => {
  const {initialHomeRoute, setInitialHomeRoute} =
    useNavigationStoreHomeSelector();

  const onStateChange = (ev: any) => {
    const state = ev.data?.state;
    if (state) {
      setInitialHomeRoute(
        state.routes[state.index].name as keyof HomeTabParamList,
      );
    }
  };

  return (
    <Tab.Navigator
      initialRouteName={initialHomeRoute}
      screenListeners={{state: onStateChange}}
      tabBarPosition="bottom"
      screenOptions={({route}) => ({
        tabBarLabel: ({color}) => {
          return <Text color={color}>{route.name}</Text>;
        },
        tabBarIcon: ({color}) => {
          let icon = faWallet;
          if (route.name === 'Earn') {
            icon = faRocket;
          } else if (route.name === 'Swap') {
            icon = faArrowRightArrowLeft;
          } else if (route.name === 'History') {
            icon = faBolt;
          }

          return <FontAwesomeIcon icon={icon} color={color} />;
        },
        tabBarIndicatorStyle: {top: 0},
        tabBarShowIcon: true,
        headerShown: false,
      })}>
      <Tab.Screen name="Assets" component={AssetsScreen} />
      <Tab.Screen name="Earn" component={EarnScreen} />
      <Tab.Screen name="Swap" component={SwapScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
    </Tab.Navigator>
  );
};
