import * as React from 'react';
import {ImageSourcePropType} from 'react-native';
import {Box, Image, Icon, Input, Text, Stack, VStack} from 'native-base';
import {AppColors} from '../config';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faKey} from '@fortawesome/free-solid-svg-icons/faKey';

export const OnboardingPasswordImage: ImageSourcePropType = require('../../assets/images/choose_password.png');

export const OnboardingPassword = () => {
  return (
    <>
      <VStack justifyContent="center" alignItems="center">
        <Text fontWeight={600} fontSize="25px" textAlign="center">
          Set up your first layer of security
        </Text>
      </VStack>

      <Box mt="19px" justifyContent="center" alignItems="center">
        <Text fontSize="16px" color="text.3" textAlign="center">
          It's fast and it's easy. You'll see..
        </Text>

        <Image
          source={OnboardingPasswordImage}
          alt="Stackup onboarding"
          w="286px"
          h="245px"
          my="20px"
        />

        <Text fontSize="16px" color="text.3" textAlign="center">
          Your money is safe with Stackup, no bad surprises.
        </Text>

        <Stack space={4} w="100%" mt="5" alignItems="center">
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
            placeholder="Choose password..."
          />

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
                ml="5px"
                mx="4"
              />
            }
            placeholder="Confirm password..."
          />
        </Stack>
      </Box>
    </>
  );
};
