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
  Spacer,
  Spinner,
} from '@chakra-ui/react';

const STATUS_TYPES = {
  pending: 'pending',
  success: 'success',
  failed: 'failed',
};

export const NewPaymentCard = ({
  isReceiving,
  isFirst,
  isLoading,
  toUsername,
  fromUsername,
  message,
  amount,
  status,
}) => {
  const avatarSize = useBreakpointValue({ base: 'sm', sm: 'md' });

  let heading;
  if (isReceiving) {
    if (status === STATUS_TYPES.pending) {
      heading = `A payment from ${fromUsername} is on its way`;
    } else if (status === STATUS_TYPES.success) {
      heading = `You received a payment from ${fromUsername}`;
    } else {
      heading = `A payment from ${fromUsername} failed to send`;
    }
  } else {
    if (status === STATUS_TYPES.pending) {
      heading = `Your payment to ${toUsername} is on its way`;
    } else if (status === STATUS_TYPES.success) {
      heading = `You sent a payment to ${toUsername}`;
    } else {
      heading = `Your payment to ${toUsername} failed to send`;
    }
  }

  const renderAvatar = () => {
    return (
      <Skeleton isLoaded={!isLoading} borderRadius="100%" alignSelf="flex-end">
        <Avatar size={avatarSize} />
      </Skeleton>
    );
  };

  const renderStatus = () => {
    if (status === STATUS_TYPES.pending) return <Spinner size="sm" color="blue.500" />;
    if (status === STATUS_TYPES.success) return <Text>✅</Text>;
    if (status === STATUS_TYPES.failed) return <Text>❌</Text>;
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
            <HStack>
              <StatLabel>{heading}</StatLabel>
              <Spacer />
              {renderStatus()}
            </HStack>
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
