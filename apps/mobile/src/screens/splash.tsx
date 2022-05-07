import * as React from 'react';
import {Box, HStack, Spinner, Heading} from 'native-base';

export const SplashScreen = () => {
  return (
    <Box flex={1} alignItems="center" justifyContent="center">
      <HStack space={2} justifyContent="center">
        <Spinner accessibilityLabel="Loading" />
        <Heading color="primary.500" fontSize="md">
          Loading
        </Heading>
      </HStack>
      ;
    </Box>
  );
};
