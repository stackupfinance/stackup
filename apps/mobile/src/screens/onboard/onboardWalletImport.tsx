import React from 'react';
import {
  Box,
  Button,
  HStack,
  Icon,
  Input,
  Link,
  Stack,
  Text,
  VStack,
} from 'native-base';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faAt} from '@fortawesome/free-solid-svg-icons/faAt';
import {faWallet} from '@fortawesome/free-solid-svg-icons/faWallet';
import {faArrowLeft} from '@fortawesome/free-solid-svg-icons/faArrowLeft';
import {AppColors, OnboardStackParamList} from '../../config';
import {IconButton} from '../../components';

type Props = NativeStackScreenProps<
  OnboardStackParamList,
  'OnboardWalletImport'
>;

export default function OnboardWalletImportScreen({navigation}: Props) {
  const onBackPress = () => {
    navigation.goBack();
  };

  const navigateNextHandler = () => {
    navigation.navigate('OnboardWalletFound');
  };

  return (
    <Box flex={1} py="25px" px="18px">
      <IconButton icon={faArrowLeft} onPress={onBackPress} />
      <VStack justifyContent="center" alignItems="center">
        <Text fontWeight={600} fontSize="25px" textAlign="center">
          Import wallet
        </Text>
        <Text mt="29px" color={AppColors.text[3]}>
          First we must retrieve your wallet address
        </Text>

        <Stack space={4} w="100%" my="10" alignItems="center">
          <Input
            fontSize="16px"
            InputLeftElement={
              <Icon
                as={
                  <FontAwesomeIcon
                    icon={faAt}
                    size={15}
                    style={{color: AppColors.text[5], marginLeft: 10}}
                  />
                }
                size={5}
                ml="2"
                mx="4"
              />
            }
            placeholder="Type in your email..."
          />
          <Box display="flex" justifyContent="flex-start">
            <Text color={AppColors.text[3]}>OR</Text>
          </Box>
          <Input
            fontSize="16px"
            InputLeftElement={
              <Icon
                as={
                  <FontAwesomeIcon
                    icon={faWallet}
                    size={15}
                    style={{color: AppColors.text[5], marginLeft: 10}}
                  />
                }
                size={5}
                ml="5px"
                mx="4"
              />
            }
            placeholder="Type in your wallet address..."
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

        <HStack>
          <Text>Don't remember any of those? </Text>
          <Link href="#">
            <Text fontSize="14px" color={AppColors.palettes.primary[600]}>
              Start a live chat with us
            </Text>
          </Link>
        </HStack>
      </VStack>
    </Box>
  );
}
