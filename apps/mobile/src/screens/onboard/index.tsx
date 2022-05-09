import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {OnboardStackParamList} from '../../config';
import CreateWalletScreen from './createWallet';

const Stack = createNativeStackNavigator<OnboardStackParamList>();

export const OnboardScreen = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="CreateWallet" component={CreateWalletScreen} />
    </Stack.Navigator>
  );
};
