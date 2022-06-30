import React from 'react';
import {Button, Image, Heading, Text, Box} from 'native-base';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {faArrowLeft} from '@fortawesome/free-solid-svg-icons/faArrowLeft';
import {OnboardStackParamList} from '../../config';
import {
  StackScreenContainer,
  IconButton,
  Saly31Illustration,
} from '../../components';
import {
  useFingerprintStoreWalletRecoveredSelector,
  useWalletStoreWalletRecoveredSelector,
} from '../../state';
import {logEvent} from '../../utils/analytics';

type Props = NativeStackScreenProps<OnboardStackParamList, 'WalletRecovered'>;

export default function WalletRecoveredScreen({navigation, route}: Props) {
  const {loading, setMasterPassword} =
    useFingerprintStoreWalletRecoveredSelector();
  const {setFromVerifiedBackup} = useWalletStoreWalletRecoveredSelector();
  const {enableFingerprint, password, instance} = route.params;

  const onBackPress = () => {
    logEvent('WALLET_RECOVERED_BACK');
    navigation.goBack();
  };

  const navigateNextHandler = async () => {
    if (enableFingerprint) {
      await setMasterPassword(password, instance.salt);
    }
    logEvent('WALLET_RECOVERED_CONTINUE');
    setFromVerifiedBackup(instance);
  };

  return (
    <StackScreenContainer>
      <IconButton icon={faArrowLeft} onPress={onBackPress} />

      <Heading mt="16px" fontWeight={600} fontSize="25px" textAlign="center">
        Your wallet has been recovered
      </Heading>

      <Text mt="16px" fontSize="16px" color="text.3" textAlign="center">
        Your crypto is safe and sound, have fun!
      </Text>

      <Box justifyContent="center" alignItems="center" w="100%">
        <Image
          mt="37px"
          source={Saly31Illustration}
          alt="Stackup onboarding"
          w="356px"
          h="245px"
        />
      </Box>

      <Box flex={1} />

      <Button isLoading={loading} onPress={navigateNextHandler}>
        Go to my wallet
      </Button>
    </StackScreenContainer>
  );
}
