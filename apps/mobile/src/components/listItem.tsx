import React, {PropsWithChildren} from 'react';
import {ImageSourcePropType} from 'react-native';
import {Box, Image, HStack} from 'native-base';

type Props = {
  source: ImageSourcePropType;
  alt: string;
};

export const ListItem = ({source, alt, children}: PropsWithChildren<Props>) => {
  return (
    <HStack
      bg="background.3"
      borderRadius="8px"
      w="100%"
      space="12px"
      justifyContent="center"
      alignItems="center"
      py="13px"
      px="16px">
      <Image source={source} alt={alt} w="40px" h="40px" />
      <Box flex={1}>{children}</Box>
    </HStack>
  );
};
