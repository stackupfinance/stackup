import React from 'react';
import {Box, Button, Text, VStack} from 'native-base';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {faArrowLeft} from '@fortawesome/free-solid-svg-icons/faArrowLeft';
import {OnboardStackParamList} from '../../config';
import {IconButton, OnboardingPassword} from '../../components';

type Props = NativeStackScreenProps<OnboardStackParamList, 'OnboardPassword'>;

export default function OnboardPasswordScreen({navigation}: Props) {
  const onBackPress = () => {
    navigation.goBack();
  };

  const navigateNextHandler = () => {
    navigation.navigate('OnboardFingerprint');
  };

  return (
    <Box flex={1} py="25px" px="18px">
      <IconButton icon={faArrowLeft} onPress={onBackPress} />
      <OnboardingPassword />

      <VStack mt="10px" alignItems="center">
        <Button width="100%" onPress={navigateNextHandler} my="25px">
          <Text fontSize="16px">Enter the crypto world</Text>
        </Button>

        <Text fontSize="14px">
          You will be able to claim your email at a later stage
        </Text>
      </VStack>
    </Box>
  );
}
