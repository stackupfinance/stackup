import formatDistance from 'date-fns/formatDistance';
import { Heading, HStack, VStack, Avatar, Text, Skeleton, Spacer } from '@chakra-ui/react';

export const UserCard = ({
  avatarSize,
  isLoading,
  isFirst,
  isLast,
  username,
  preview,
  timestamp,
  onClick = () => {},
}) => {
  return (
    <HStack
      as="button"
      _hover={{ bg: 'blue.100' }}
      onClick={onClick}
      w="100%"
      spacing="16px"
      p="16px"
      borderWidth="1px"
      borderBottomWidth={!isLast && '0px'}
      borderTopRadius={isFirst && 'lg'}
      borderBottomRadius={isLast && 'lg'}
    >
      <Skeleton isLoaded={!isLoading} borderRadius="100%">
        <Avatar size={avatarSize} />
      </Skeleton>
      <VStack spacing="8px" w="100%" justifyContent="center" alignItems="left">
        <HStack>
          <Skeleton isLoaded={!isLoading}>
            <Heading fontSize={!timestamp ? 'lg' : 'sm'}>{username}</Heading>
          </Skeleton>

          <Spacer />

          {timestamp && (
            <Skeleton isLoaded={!isLoading}>
              <Text color="blue.500" fontSize="xs" fontWeight="bold">
                {formatDistance(new Date(timestamp), new Date(), { addSuffix: true })}
              </Text>
            </Skeleton>
          )}
        </HStack>

        {preview && (
          <Skeleton isLoaded={!isLoading}>
            <Text fontSize="xs" textAlign="left">
              {preview}
            </Text>
          </Skeleton>
        )}
      </VStack>
    </HStack>
  );
};
