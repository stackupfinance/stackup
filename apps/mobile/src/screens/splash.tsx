import * as React from 'react';
import {Box, HStack, Heading} from 'native-base';

export const SplashScreen = () => {
  return (
    <Box flex={1} alignItems="center" justifyContent="center">
      <HStack space={2} justifyContent="center">
        <Heading color="primary.500" fontSize="md">
          Stackup
        </Heading>
      </HStack>
      ;
    </Box>
  );
};
