import React from 'react';
import {Box, Button, Icon, Input, Link, Stack, Text, VStack} from 'native-base';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faKey} from '@fortawesome/free-solid-svg-icons/faKey';
import {faArrowLeft} from '@fortawesome/free-solid-svg-icons/faArrowLeft';
import {AppColors, OnboardStackParamList} from '../../config';
import {IconButton} from '../../components';

type Props = NativeStackScreenProps<
  OnboardStackParamList,
  'OnboardMasterPassword'
>;

export default function OnboardMasterPasswordScreen({navigation}: Props) {
  const onBackPress = () => {
    navigation.goBack();
  };

  const navigateNextHandler = () => {
    navigation.navigate('OnboardWalletRecovered');
  };

  return (
    <Box flex={1} py="25px" px="18px">
      <IconButton icon={faArrowLeft} onPress={onBackPress} />
      <VStack justifyContent="center" alignItems="center">
        <Text fontWeight={600} fontSize="25px" textAlign="center">
          Type in your master password
        </Text>
        <Text mt="29px" color={AppColors.text[3]}>
          Your master password is the last step of your wallet recovery
        </Text>

        <Stack space={4} w="100%" my="10" alignItems="center">
          <Input
            fontSize="16px"
            InputLeftElement={
              <Icon
                as={
                  <FontAwesomeIcon
                    icon={faKey}
                    size={15}
                    style={{color: AppColors.text[5], marginLeft: 10}}
                  />
                }
                size={5}
                ml="2"
                mx="4"
              />
            }
            placeholder="Type in your master password..."
          />
        </Stack>

        <Link mt="10px" href="#">
          <Text fontSize="14px" color={AppColors.palettes.primary[600]}>
            Need help? Start live chat
          </Text>
        </Link>

        <Button width="100%" onPress={navigateNextHandler} my="25px">
          <Text fontSize="16px">Continue</Text>
        </Button>
      </VStack>
    </Box>
  );
}
