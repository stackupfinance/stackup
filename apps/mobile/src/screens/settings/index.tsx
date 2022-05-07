import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SettingsStackParamList} from '../../config';
import OverviewScreen from './overview';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export const SettingsScreen = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Overview" component={OverviewScreen} />
    </Stack.Navigator>
  );
};
