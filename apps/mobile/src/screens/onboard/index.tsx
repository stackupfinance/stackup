import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {OnboardStackParamList} from '../../config';
import WelcomeScreen from './welcome';
import PasswordScreen from './password';
import WalletImportScreen from './walletImport';
import MasterPasswordScreen from './masterPassword';
import WalletRecoveredScreen from './walletRecovered';

const Stack = createNativeStackNavigator<OnboardStackParamList>();

export const OnboardScreen = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="Welcome">
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Password" component={PasswordScreen} />
      <Stack.Screen name="WalletImport" component={WalletImportScreen} />
      <Stack.Screen name="MasterPassword" component={MasterPasswordScreen} />
      <Stack.Screen name="WalletRecovered" component={WalletRecoveredScreen} />
    </Stack.Navigator>
  );
};
