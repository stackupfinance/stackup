import React, {useRef, MutableRefObject} from 'react';
import {StatusBar} from 'react-native';
import {NativeBaseProvider} from 'native-base';
import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {gestureHandlerRootHOC} from 'react-native-gesture-handler';
import * as Sentry from '@sentry/react-native';
import {
  HomeScreen,
  SecurityScreen,
  OnboardScreen,
  SplashScreen,
} from './src/screens';
import {
  RootStackParamList,
  NativeBaseTheme,
  NavigationTheme,
  Env,
} from './src/config';
import {useAuth} from './src/hooks';
import {useNavigationStoreAppSelector} from './src/state';

const routingInstrumentation = new Sentry.ReactNavigationInstrumentation();
Sentry.init({
  dsn: Env.SENTRY_DSN,
  tracesSampleRate: 0.5,
  integrations: [new Sentry.ReactNativeTracing({routingInstrumentation})],
});

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  const {isReady, hasWalletInstance} = useAuth();
  const {initialNavigationState, setInitialNavigationState} =
    useNavigationStoreAppSelector();
  const navigation = useRef() as MutableRefObject<
    NavigationContainerRef<RootStackParamList>
  >;

  return (
    <NativeBaseProvider theme={NativeBaseTheme}>
      <StatusBar barStyle="light-content" />
      {isReady ? (
        <NavigationContainer
          ref={navigation}
          theme={NavigationTheme}
          initialState={initialNavigationState}
          onStateChange={setInitialNavigationState}
          onReady={() => {
            routingInstrumentation.registerNavigationContainer(navigation);
          }}>
          <Stack.Navigator screenOptions={{headerShown: false}}>
            {hasWalletInstance ? (
              <>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Security" component={SecurityScreen} />
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

export default Sentry.wrap(gestureHandlerRootHOC(App));
