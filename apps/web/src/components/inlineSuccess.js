import { Text } from '@chakra-ui/react';

export const InlineSuccess = ({ message }) => (
  <Text mt="8px" color="green.500" fontSize="xs">
    {message}
  </Text>
);
