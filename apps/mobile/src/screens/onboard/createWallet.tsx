import * as React from 'react';
import {Box, Text, Button} from 'native-base';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {OnboardStackParamList} from '../../config';
import {useWalletStoreCreateWalletSelector} from '../../state';

type Props = NativeStackScreenProps<OnboardStackParamList, 'CreateWallet'>;

export default function CreateWalletScreen({}: Props) {
  const {loading, create} = useWalletStoreCreateWalletSelector();

  return (
    <Box flex={1} alignItems="center" justifyContent="center">
      <Text mb="16px" color="black">
        Create Wallet Screen
      </Text>

      <Button isLoading={loading} onPress={create}>
        Create wallet
      </Button>
    </Box>
  );
}
