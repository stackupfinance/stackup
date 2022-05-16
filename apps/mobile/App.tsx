import * as React from 'react';
import {NativeBaseProvider, Box, useColorModeValue} from 'native-base';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  HomeScreen,
  SecurityScreen,
  SettingsScreen,
  OnboardScreen,
  SplashScreen,
  ExampleScreen,
} from './src/screens';
import {RootStackParamList, NativeBaseTheme} from './src/config';
import {useAuth} from './src/hooks';
import {useNavigationStoreAppSelector} from './src/state';

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  const {isReady, hasWalletInstance} = useAuth();
  const {initialNavigationState, setInitialNavigationState} =
    useNavigationStoreAppSelector();

  return (
    <NativeBaseProvider theme={NativeBaseTheme}>
      {isReady ? (
        <NavigationContainer
          initialState={initialNavigationState}
          onStateChange={setInitialNavigationState}>
          <Stack.Navigator screenOptions={{headerShown: false}}>
            {hasWalletInstance ? (
              <>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Security" component={SecurityScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
              </>
            ) : (
              <>
                {/* <Stack.Screen name="Onboard" component={OnboardScreen} /> */}
                <Stack.Screen name="Example" component={ExampleScreen} />
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
