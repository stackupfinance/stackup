import { Heading, HStack, VStack, Image, Text, Skeleton, Spacer } from '@chakra-ui/react';
import { displayUSDC, displayGenericToken } from '../utils/web3';

export const TokenCard = ({
  isLoading,
  isLast,
  isFirst,
  name,
  logo,
  valueWei,
  decimals,
  symbol,
  valueUsdc,
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
      borderBottomWidth={!isLast && '1px'}
      borderTopRadius={isFirst && 'lg'}
      borderBottomRadius={isLast && 'lg'}
    >
      <Skeleton isLoaded={!isLoading} borderRadius="100%">
        <Image src={logo} w="32px" h="32px" alt="token logo" />
      </Skeleton>

      <HStack w="100%">
        <Skeleton flex={2} isLoaded={!isLoading}>
          <Heading fontSize="md" textAlign="left" textOverflow="ellipsis" noOfLines={2}>
            {name}
          </Heading>
        </Skeleton>

        <Spacer />

        <VStack spacing="2px" alignItems="end">
          <Skeleton isLoaded={!isLoading}>
            <Text fontSize="sm" textAlign="right" fontWeight="bold">
              {displayGenericToken(valueWei, decimals, symbol)}
            </Text>
          </Skeleton>

          <Skeleton isLoaded={!isLoading} w={isLoading}>
            <Text fontSize="xs" textAlign="right" color="gray.500">
              {displayUSDC(valueUsdc)}
            </Text>
          </Skeleton>
        </VStack>
      </HStack>
    </HStack>
  );
};
