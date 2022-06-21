import React, {useState} from 'react';
import {Button, Input, Heading, Text, Box, HStack, useToast} from 'native-base';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faKey} from '@fortawesome/free-solid-svg-icons/faKey';
import {faArrowLeft} from '@fortawesome/free-solid-svg-icons/faArrowLeft';
import {AppColors, OnboardStackParamList} from '../../config';
import {StackScreenContainer, IconButton} from '../../components';
import {
  useIntercomStoreMasterPasswordSelector,
  useWalletStoreMasterPasswordSelector,
} from '../../state';

type Props = NativeStackScreenProps<OnboardStackParamList, 'MasterPassword'>;

export default function MasterPasswordScreen({navigation, route}: Props) {
  const toast = useToast();
  const {openMessenger} = useIntercomStoreMasterPasswordSelector();
  const {loading, verifyEncryptedBackup} =
    useWalletStoreMasterPasswordSelector();
  const [password, setPassword] = useState('');
  const {enableFingerprint, walletAddress} = route.params;

  const onHelpPress = () => {
    openMessenger();
  };

  const onBackPress = () => {
    navigation.goBack();
  };

  const navigateNextHandler = async () => {
    if (!password) {
      toast.show({
        title: 'Password is required',
        backgroundColor: AppColors.singletons.warning,
        placement: 'top',
      });

      return;
    }

    const verifiedWalletInstance = await verifyEncryptedBackup(
      walletAddress,
      password,
    );
    if (verifiedWalletInstance) {
      navigation.navigate('WalletRecovered', {
        enableFingerprint,
        password,
        instance: verifiedWalletInstance,
      });
    } else {
      toast.show({
        title: 'Incorrect password',
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
          2/2
        </Text>
      </HStack>

      <Heading mt="16px" fontWeight={600} fontSize="25px" textAlign="center">
        Type in your master password
      </Heading>

      <Text mt="16px" fontSize="16px" color="text.3" textAlign="center">
        Your master password is the last step of your wallet recovery
      </Text>

      <Input
        mt="27px"
        type="password"
        placeholder="Type in your master password..."
        onChangeText={setPassword}
        leftElement={
          <Box ml="13px">
            <FontAwesomeIcon icon={faKey} color={AppColors.text[5]} size={18} />
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
    </StackScreenContainer>
  );
}
