import React, {useEffect} from 'react';
import {Linking} from 'react-native';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {
  RootStackParamList,
  SecurityStackParamList,
  externalLinks,
} from '../../config';
import OverviewScreen from './overview';
import {
  EmailSheet,
  VerifyEmailSheet,
  EmailConfirmedSheet,
} from '../../components';
import {useNavigationStoreSecuritySelector} from '../../state';

const Stack = createNativeStackNavigator<SecurityStackParamList>();

type Props = NativeStackScreenProps<RootStackParamList, 'Security'>;

export const SecurityScreen = ({navigation}: Props) => {
  const {
    showEmailSheet,
    showVerifyEmailSheet,
    showEmailConfirmedSheet,
    setShowEmailSheet,
    setShowVerifyEmailSheet,
    setShowEmailConfirmedSheet,
    resetAllSheets,
  } = useNavigationStoreSecuritySelector();

  useEffect(() => {
    return () => {
      resetAllSheets();
    };
  }, [resetAllSheets]);

  const onCloseEmailSheet = () => {
    setShowEmailSheet(false);
  };

  const onCloseVerifyEmailSheet = () => {
    setShowVerifyEmailSheet(false);
  };

  const onCloseEmailConfirmedSheet = () => {
    setShowEmailConfirmedSheet(false);
  };

  const onEmailSubmit = () => {
    setShowVerifyEmailSheet(true);
  };

  const onVerifyEmailSubmit = () => {
    setShowEmailConfirmedSheet(true);
  };

  const onEmailConfirmedSubmit = () => {
    navigation.goBack();
  };

  const OnVerifyEmailBack = () => {
    setShowEmailSheet(true);
  };

  const onDiscordPress = () => {
    Linking.openURL(externalLinks.discord);
  };

  return (
    <>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Overview" component={OverviewScreen} />
      </Stack.Navigator>

      <EmailSheet
        isOpen={showEmailSheet}
        onClose={onCloseEmailSheet}
        onSubmit={onEmailSubmit}
      />

      <VerifyEmailSheet
        isOpen={showVerifyEmailSheet}
        onClose={onCloseVerifyEmailSheet}
        onBack={OnVerifyEmailBack}
        onSubmit={onVerifyEmailSubmit}
      />

      <EmailConfirmedSheet
        isOpen={showEmailConfirmedSheet}
        onClose={onCloseEmailConfirmedSheet}
        onSubmit={onEmailConfirmedSubmit}
        onDiscordPress={onDiscordPress}
      />
    </>
  );
};
