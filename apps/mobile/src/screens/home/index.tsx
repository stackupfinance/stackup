import * as React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {HomeTabParamList} from '../../config';
import AssetsScreen from './assets';
import EarnScreen from './earn';
import SwapScreen from './swap';
import HistoryScreen from './history';

const Tab = createBottomTabNavigator<HomeTabParamList>();

export const HomeScreen = () => {
  return (
    <Tab.Navigator screenOptions={{headerShown: false}}>
      <Tab.Screen name="Assets" component={AssetsScreen} />
      <Tab.Screen name="Earn" component={EarnScreen} />
      <Tab.Screen name="Swap" component={SwapScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
    </Tab.Navigator>
  );
};
