import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SecurityStackParamList} from '../../config';
import OverviewScreen from './overview';

const Stack = createNativeStackNavigator<SecurityStackParamList>();

export const SecurityScreen = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Overview" component={OverviewScreen} />
    </Stack.Navigator>
  );
};
