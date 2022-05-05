import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {OnboardStackParamList} from '../../config';
import LoginScreen from './login';

const Stack = createNativeStackNavigator<OnboardStackParamList>();

export const OnboardScreen = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
};
