import { Text } from '@chakra-ui/react';

export const InlineError = ({ message }) => (
  <Text mt="8px" color="red.500" fontSize="xs">
    {message}
  </Text>
);
