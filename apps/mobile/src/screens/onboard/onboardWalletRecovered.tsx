import React from 'react';
import {ImageSourcePropType} from 'react-native';
import {Box, Button, Image, Stack, Text, VStack} from 'native-base';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {faArrowLeft} from '@fortawesome/free-solid-svg-icons/faArrowLeft';
import {AppColors, OnboardStackParamList} from '../../config';
import {IconButton} from '../../components';
export const OnboardingWalletRecoveredImage: ImageSourcePropType = require('../../../assets/images/wallet_recovered.png');

type Props = NativeStackScreenProps<
  OnboardStackParamList,
  'OnboardWalletRecovered'
>;

export default function OnboardWalletRecoveredScreen({navigation}: Props) {
  const onBackPress = () => {
    navigation.goBack();
  };

  const navigateNextHandler = () => {
    navigation.navigate('OnboardWelcome');
  };

  return (
    <Box flex={1} py="25px" px="18px">
      <IconButton icon={faArrowLeft} onPress={onBackPress} />
      <VStack justifyContent="center" alignItems="center">
        <Text fontWeight={600} fontSize="25px" textAlign="center">
          Your wallet has been recovered
        </Text>
        <Text mt="29px" fontSize="16px" color={AppColors.text[3]}>
          Your crypto is safe and sound, have fun!
        </Text>

        <Stack space={4} w="100%" alignItems="center">
          <Image
            source={OnboardingWalletRecoveredImage}
            alt="Stackup onboarding"
            w="286px"
            h="245px"
            my="10px"
          />
        </Stack>

        <Button width="100%" onPress={navigateNextHandler} my="25px">
          <Text fontSize="16px">Go to My Wallet</Text>
        </Button>
      </VStack>
    </Box>
  );
}
