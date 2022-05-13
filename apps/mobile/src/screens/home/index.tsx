import * as React from 'react';
import {Text} from 'native-base';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faWallet} from '@fortawesome/free-solid-svg-icons/faWallet';
import {faRocket} from '@fortawesome/free-solid-svg-icons/faRocket';
import {faArrowRightArrowLeft} from '@fortawesome/free-solid-svg-icons/faArrowRightArrowLeft';
import {faBolt} from '@fortawesome/free-solid-svg-icons/faBolt';
import {HomeTabParamList} from '../../config';
import AssetsScreen from './assets';
import EarnScreen from './earn';
import SwapScreen from './swap';
import ActivityScreen from './activity';

const Tab = createMaterialTopTabNavigator<HomeTabParamList>();

export const HomeScreen = () => {
  return (
    <Tab.Navigator
      tabBarPosition="bottom"
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
      <Tab.Screen name="Earn" component={EarnScreen} />
      <Tab.Screen name="Swap" component={SwapScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
    </Tab.Navigator>
  );
};
