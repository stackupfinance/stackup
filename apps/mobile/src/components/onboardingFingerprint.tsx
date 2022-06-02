import * as React from 'react';
import {ImageSourcePropType} from 'react-native';
import {Box, Image, Text, VStack} from 'native-base';

export const OnboardingFingerprintImage: ImageSourcePropType = require('../../assets/images/fingerprint_setting.png');

export const OnboardingFingerprint = () => {
  return (
    <>
      <VStack justifyContent="center" alignItems="center">
        <Text fontWeight={600} fontSize="25px" textAlign="center">
          Let's set up your Fingerprint
        </Text>
      </VStack>

      <Box mt="19px" justifyContent="center" alignItems="center">
        <Text fontSize="16px" color="text.3" textAlign="center">
          Just a few seconds until your very own crypto account is generated!
        </Text>

        <Image
          source={OnboardingFingerprintImage}
          alt="Stackup onboarding"
          w="286px"
          h="245px"
          my="20px"
        />
      </Box>
    </>
  );
};
