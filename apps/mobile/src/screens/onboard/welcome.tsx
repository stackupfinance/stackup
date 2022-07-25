import React, {useState} from 'react';
import {Linking} from 'react-native';
import {Box, Button, Text, Heading, Image} from 'native-base';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {OnboardStackParamList, externalLinks} from '../../config';
import {useFingerprintStoreWelcomeSelector} from '../../state';
import {
  StackScreenContainer,
  EnableFingerprint,
  Saly43Illustration,
} from '../../components';
import {logEvent} from '../../utils/analytics';

type Props = NativeStackScreenProps<OnboardStackParamList, 'Welcome'>;

export default function WelcomeScreen({navigation}: Props) {
  const {loading, isSupported} = useFingerprintStoreWelcomeSelector();
  const [enableFingerprint, setEnableFingerprint] = useState(false);

  const navigateNextHandler = () => {
    logEvent('WELCOME_CREATE');
    navigation.navigate('Password', {enableFingerprint});
  };

  const navigateImportWalletHandler = () => {
    logEvent('WELCOME_IMPORT');
    navigation.navigate('WalletImport', {enableFingerprint});
  };

  const onDiscordPress = () => {
    logEvent('JOIN_DISCORD', {screen: 'Welcome'});
    Linking.openURL(externalLinks.discord);
  };

  return (
    <StackScreenContainer>
      <Heading mt="16px" fontWeight={600} fontSize="25px" textAlign="center">
        Welcome to crypto
      </Heading>

      <Text mt="32px" fontSize="16px" color="text.3" textAlign="center">
        We're excited to see you're starting your fascinating journey into
        cryptocurrency!
      </Text>

      <Box justifyContent="center" alignItems="center" w="100%">
        <Image
          source={Saly43Illustration}
          w="384px"
          h="297px"
          resizeMode="cover"
          alt="welcome-illustration"
        />
      </Box>

      <Text mt="8px" fontSize="16px" color="text.3" textAlign="center">
        Crypto is confusing, you're not alone in this...
      </Text>

      <Button
        w="100%"
        variant="link"
        onPress={onDiscordPress}
        _text={{textAlign: 'center', fontWeight: 600, fontSize: '14px'}}>
        {'Come say hello on Discord :)'}
      </Button>

      {isSupported && (
        <Box mt="16px">
          <EnableFingerprint
            enabled={enableFingerprint}
            onValueChange={setEnableFingerprint}
          />
        </Box>
      )}

      <Button
        mt="16px"
        isLoading={loading}
        width="100%"
        onPress={navigateNextHandler}>
        Create your crypto account
      </Button>

      <Button
        w="100%"
        variant="link"
        onPress={navigateImportWalletHandler}
        _text={{textAlign: 'center', fontWeight: 600, fontSize: '14px'}}>
        Recover your Stackup account
      </Button>
    </StackScreenContainer>
  );
}
