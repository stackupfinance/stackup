import * as React from 'react';
import {ImageSourcePropType} from 'react-native';
import {Box, Image, Text, VStack} from 'native-base';

export const OnboardingWelcomeImage: ImageSourcePropType = require('../../assets/images/onboarding-welcome-image.png');

export const OnboardingOverview = () => {
  return (
    <>
      <VStack justifyContent="center" alignItems="center">
        <Text fontWeight={600} fontSize="25px" textAlign="center">
          Welcome to crypto
        </Text>
      </VStack>

      <Box mt="19px" justifyContent="center" alignItems="center">
        <Text fontSize="16px" color="text.3" textAlign="center">
          We're excited to see you're starting your fascinating journey in
          cryptocurrency!
        </Text>

        <Image
          source={OnboardingWelcomeImage}
          alt="Stackup onboarding"
          w="286px"
          h="245px"
          my="10px"
        />

        <Text fontSize="16px" color="text.3" textAlign="center">
          Pssh.. Crypto is confusing, you're not alone in this...
        </Text>
      </Box>
    </>
  );
};
