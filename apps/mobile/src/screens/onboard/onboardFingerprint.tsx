import React, {useState} from 'react';
import {Box, Button, Link, Text, VStack} from 'native-base';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {faArrowLeft} from '@fortawesome/free-solid-svg-icons/faArrowLeft';
import {AppColors, OnboardStackParamList} from '../../config';
import {
  useWalletStoreCreateWalletSelector,
  useFingerprintStoreCreateWalletSelector,
} from '../../state';
import {generateSalt} from '../../utils/random';
import {logEvent} from '../../utils/analytics';
import {IconButton, OnboardingFingerprint} from '../../components';

type Props = NativeStackScreenProps<
  OnboardStackParamList,
  'OnboardMasterPassword'
>;

export default function OnboardFingerprintScreen({navigation}: Props) {
  const {loading: walletLoading, create} = useWalletStoreCreateWalletSelector();
  const {setMasterPassword} = useFingerprintStoreCreateWalletSelector();
  const [enableFingerprint, setEnableFingerprint] = useState(false);

  const loading = walletLoading;

  const onBackPress = () => {
    navigation.goBack();
  };

  const onCreateWallet = () => {
    create('tempPass123', generateSalt(), async (password, salt) => {
      logEvent('CREATE_WALLET', {enableFingerprint});
      enableFingerprint && setMasterPassword(password, salt);
    });
  };

  return (
    <Box flex={1} py="25px" px="18px">
      <IconButton icon={faArrowLeft} onPress={onBackPress} />
      <OnboardingFingerprint />

      <VStack mt="10px" alignItems="center">
        <Link href="#">
          <Text fontSize="14px" color={AppColors.palettes.primary[600]}>
            Click me to set up Fingerprint
          </Text>
        </Link>

        <Button
          width="100%"
          isLoading={loading}
          onPress={onCreateWallet}
          my="25px">
          <Text fontSize="16px">Enter the crypto world</Text>
        </Button>

        <Text fontSize="14px">
          You will be able to claim your email at a later stage
        </Text>
      </VStack>
    </Box>
  );
}
