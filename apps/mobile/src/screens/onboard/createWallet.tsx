import React, {useState} from 'react';
import {Box, Text, Button, Switch, HStack} from 'native-base';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {OnboardStackParamList} from '../../config';
import {
  useWalletStoreCreateWalletSelector,
  useFingerprintStoreCreateWalletSelector,
} from '../../state';
import {generateSalt} from '../../utils/random';

type Props = NativeStackScreenProps<OnboardStackParamList, 'CreateWallet'>;

export default function CreateWalletScreen({}: Props) {
  const {loading: walletLoading, create} = useWalletStoreCreateWalletSelector();
  const {
    loading: fingerprintLoading,
    isSupported,
    setMasterPassword,
  } = useFingerprintStoreCreateWalletSelector();
  const [enableFingerprint, setEnableFingerprint] = useState(false);

  const loading = walletLoading || fingerprintLoading;

  const onCreateWallet = () => {
    create(
      'tempPass123',
      generateSalt(),
      enableFingerprint ? setMasterPassword : undefined,
    );
  };

  return (
    <Box flex={1} alignItems="center" justifyContent="center">
      <Text mb="16px" color="black">
        Create Wallet Screen
      </Text>

      {isSupported && (
        <HStack
          mb="16px"
          space="lg"
          justifyContent="center"
          alignItems="center">
          <Text>Enable fingerprint</Text>
          <Switch
            size="lg"
            value={enableFingerprint}
            onValueChange={setEnableFingerprint}
          />
        </HStack>
      )}

      <Button isLoading={loading} onPress={onCreateWallet}>
        Create wallet
      </Button>
    </Box>
  );
}
