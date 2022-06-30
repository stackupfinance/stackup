import React, {useState} from 'react';
import {Box, Button, HStack, Input, Heading, Text, useToast} from 'native-base';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faWallet} from '@fortawesome/free-solid-svg-icons/faWallet';
import {faArrowLeft} from '@fortawesome/free-solid-svg-icons/faArrowLeft';
import {AppColors, OnboardStackParamList} from '../../config';
import {StackScreenContainer, IconButton} from '../../components';
import {
  useIntercomStoreWalletImportSelector,
  useWalletStoreWalletImportSelector,
} from '../../state';
import {isValid} from '../../utils/address';
import {logEvent} from '../../utils/analytics';

type Props = NativeStackScreenProps<OnboardStackParamList, 'WalletImport'>;

export default function WalletImportScreen({navigation, route}: Props) {
  const toast = useToast();
  const {openMessenger} = useIntercomStoreWalletImportSelector();
  const {loading, pingBackup} = useWalletStoreWalletImportSelector();
  const [address, setAddress] = useState('');
  const {enableFingerprint} = route.params;

  const onHelpPress = () => {
    logEvent('OPEN_SUPPORT', {screen: 'WalletImport'});
    openMessenger();
  };

  const onBackPress = () => {
    logEvent('WALLET_IMPORT_BACK');
    navigation.goBack();
  };

  const navigateNextHandler = async () => {
    if (!isValid(address)) {
      toast.show({
        title: 'Not a valid address',
        backgroundColor: AppColors.singletons.warning,
        placement: 'top',
      });

      return;
    }

    if (await pingBackup(address)) {
      logEvent('WALLET_IMPORT_CONTINUE');
      navigation.navigate('MasterPassword', {
        enableFingerprint,
        walletAddress: address,
      });
    } else {
      toast.show({
        title: 'Wallet not found...',
        backgroundColor: AppColors.singletons.warning,
        placement: 'top',
      });
    }
  };

  return (
    <StackScreenContainer>
      <HStack justifyContent="space-between">
        <IconButton icon={faArrowLeft} onPress={onBackPress} />

        <Text fontWeight={500} fontSize="16px" color="text.4">
          1/2
        </Text>
      </HStack>

      <Heading mt="16px" fontWeight={600} fontSize="25px" textAlign="center">
        Import wallet
      </Heading>

      <Text mt="40px" fontSize="16px" color="text.3" textAlign="center">
        First we must retrieve your wallet address
      </Text>

      <Input
        mt="27px"
        placeholder="Enter your wallet address..."
        onChangeText={setAddress}
        leftElement={
          <Box ml="13px">
            <FontAwesomeIcon
              icon={faWallet}
              color={AppColors.text[5]}
              size={18}
            />
          </Box>
        }
      />

      <Box flex={1} />

      <Button
        w="100%"
        variant="link"
        onPress={onHelpPress}
        _text={{textAlign: 'center', fontWeight: 600, fontSize: '14px'}}>
        Need help? Start live chat
      </Button>

      <Button isLoading={loading} onPress={navigateNextHandler} mt="8px">
        Continue
      </Button>

      <Text my="16px" fontSize="11px" fontFamily="heading" textAlign="center">
        Don't remember any of those? Start a live chat with us
      </Text>
    </StackScreenContainer>
  );
}
