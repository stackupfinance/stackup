import {
  HStack,
  Box,
  Avatar,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  useBreakpointValue,
  Skeleton,
} from '@chakra-ui/react';

export const NewPaymentCard = ({
  isFirst,
  isLoading,
  toUsername,
  fromUsername,
  message,
  amount,
}) => {
  const isReceiving = Boolean(fromUsername);
  const heading = isReceiving
    ? `You received a payment from ${fromUsername}`
    : `You sent a payment to ${toUsername}`;
  const avatarSize = useBreakpointValue({ base: 'sm', sm: 'md' });

  const renderAvatar = () => {
    return (
      <Skeleton isLoaded={!isLoading} borderRadius="100%" alignSelf="flex-end">
        <Avatar size={avatarSize} />
      </Skeleton>
    );
  };

  return (
    <HStack mb={isFirst ? '0px' : '16px'}>
      {isReceiving && renderAvatar()}
      <Box w="100%">
        <Stat
          borderWidth="1px"
          borderBottom="0px"
          borderTopRadius="lg"
          bg="white"
          w="100%"
          p="16px"
          textAlign="left"
        >
          <Skeleton isLoaded={!isLoading}>
            <StatLabel>{heading}</StatLabel>
          </Skeleton>
          <Skeleton isLoaded={!isLoading} mt={isLoading ? '8px' : undefined}>
            <StatNumber>{amount}</StatNumber>
          </Skeleton>
        </Stat>
        <Skeleton isLoaded={!isLoading} borderBottomRadius="lg">
          <Text
            p="8px"
            borderWidth="1px"
            borderBottomRadius="lg"
            bg={isReceiving ? 'blue.50' : 'teal.50'}
          >
            {message}
          </Text>
        </Skeleton>
      </Box>
      {!isReceiving && renderAvatar()}
    </HStack>
  );
};
