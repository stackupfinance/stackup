import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {OnboardStackParamList} from '../../config';
import OnboardWelcomeScreen from './onboardWelcome';
import OnboardPasswordScreen from './onboardPassword';
import OnboardFingerprintScreen from './onboardFingerprint';
import OnboardWalletImportScreen from './onboardWalletImport';
import OnboardWalletFoundScreen from './onboardWalletFound';
import OnboardMasterPasswordScreen from './onboardMasterPassword';
import OnboardWalletRecoveredScreen from './onboardWalletRecovered';

const Stack = createNativeStackNavigator<OnboardStackParamList>();

export const OnboardScreen = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName="OnboardWelcome">
      <Stack.Screen name="OnboardWelcome" component={OnboardWelcomeScreen} />
      <Stack.Screen name="OnboardPassword" component={OnboardPasswordScreen} />
      <Stack.Screen
        name="OnboardFingerprint"
        component={OnboardFingerprintScreen}
      />
      <Stack.Screen
        name="OnboardWalletImport"
        component={OnboardWalletImportScreen}
      />
      <Stack.Screen
        name="OnboardWalletFound"
        component={OnboardWalletFoundScreen}
      />
      <Stack.Screen
        name="OnboardMasterPassword"
        component={OnboardMasterPasswordScreen}
      />
      <Stack.Screen
        name="OnboardWalletRecovered"
        component={OnboardWalletRecoveredScreen}
      />
    </Stack.Navigator>
  );
};
