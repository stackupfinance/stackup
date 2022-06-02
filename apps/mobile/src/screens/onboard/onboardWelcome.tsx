import React, {useState} from 'react';
import {Box, Button, Link, Text, VStack} from 'native-base';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppColors, OnboardStackParamList} from '../../config';
import {
  useWalletStoreCreateWalletSelector,
  useFingerprintStoreCreateWalletSelector,
} from '../../state';
import {
  FingerprintLogo,
  OnboardingOverview,
  OnboardingItem,
} from '../../components';

type Props = NativeStackScreenProps<OnboardStackParamList, 'OnboardWelcome'>;

export default function OnboardWelcomeScreen({navigation}: Props) {
  const {loading: walletLoading} = useWalletStoreCreateWalletSelector();
  const {loading: fingerprintLoading, isSupported} =
    useFingerprintStoreCreateWalletSelector();
  const [enableFingerprint, setEnableFingerprint] = useState(false);

  const loading = walletLoading || fingerprintLoading;

  const navigateNextHandler = () => {
    navigation.navigate('OnboardPassword');
  };

  const navigateImportWalletHandler = () => {
    navigation.navigate('OnboardWalletImport');
  };

  return (
    <Box flex={1} py="25px" px="18px">
      <OnboardingOverview />

      {isSupported && (
        <VStack mt="29px" space="9px">
          <OnboardingItem
            heading="Enable fingerprint"
            description=""
            source={FingerprintLogo}
            isActive={true}
            showArrow={false}
            switchValue={enableFingerprint}
            onSwitchValueChange={setEnableFingerprint}
          />
        </VStack>
      )}

      <VStack mt="29px" alignItems="center">
        <Link href="#">
          <Text fontSize="14px" color={AppColors.palettes.primary[600]}>
            Come say hello on Dischord : )
          </Text>
        </Link>

        <Button
          width="100%"
          isLoading={loading}
          onPress={navigateNextHandler}
          my="25px">
          <Text fontSize="16px">Create your crypto account</Text>
        </Button>

        <Link onPress={navigateImportWalletHandler}>
          <Text fontSize="14px" color={AppColors.palettes.primary[600]}>
            Import wallet instead
          </Text>
        </Link>
      </VStack>
    </Box>
  );
}
