import * as React from 'react';
import {NativeBaseProvider} from 'native-base';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  HomeScreen,
  SecurityScreen,
  SettingsScreen,
  OnboardScreen,
  SplashScreen,
} from './src/screens';
import {RootStackParamList} from './src/config';
import {useAuth} from './src/hooks';

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  const {isReady, hasWalletInstance} = useAuth();

  return (
    <NativeBaseProvider>
      {isReady ? (
        <NavigationContainer>
          <Stack.Navigator screenOptions={{headerShown: false}}>
            {hasWalletInstance ? (
              <>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Security" component={SecurityScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
              </>
            ) : (
              <>
                <Stack.Screen name="Onboard" component={OnboardScreen} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      ) : (
        <SplashScreen />
      )}
    </NativeBaseProvider>
  );
}

export default App;
