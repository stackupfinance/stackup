import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ExampleStackParamList} from '../../config';
import DoThingsScreen from './doThings';

const Stack = createNativeStackNavigator<ExampleStackParamList>();

export const ExampleScreen = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="DoThings" component={DoThingsScreen} />
    </Stack.Navigator>
  );
};
