import format from 'date-fns/format';
import { Heading, HStack, VStack, Avatar, Text, Icon, Spacer, Skeleton } from '@chakra-ui/react';
import { AiOutlineExclamation } from 'react-icons/ai';
import { displayUSDC } from '../utils/web3';

export const TransactionCard = ({
  isLoading,
  isLastInSection,
  isLastInList,
  lineItems = [],
  fee,
  timestamp,
  onClick = () => {},
}) => {
  const [firstLineItem, ...otherLineItems] = lineItems;
  const extraLineItems = otherLineItems ?? [];
  const { from, to, value, sideEffect, isReceiving } = firstLineItem;

  return (
    <>
      <HStack
        as="button"
        _hover={{ bg: 'blue.100' }}
        onClick={onClick}
        borderBottomRadius={isLastInList && extraLineItems.length === 0 && 'lg'}
        w="100%"
        pl="16px"
        spacing="16px"
      >
        <Skeleton isLoaded={!isLoading} borderRadius="lg">
          <Avatar size="sm" borderRadius="lg" />
        </Skeleton>

        <HStack
          w="100%"
          py="8px"
          pr="16px"
          borderBottomWidth={
            ((!isLastInSection && !isLastInList) || extraLineItems.length > 0) && '1px'
          }
        >
          <VStack spacing="4px" alignItems="left">
            <Skeleton isLoaded={!isLoading} width={isLoading && '128px'}>
              <Heading fontSize="sm" textAlign="left">
                {sideEffect ?? (isReceiving ? from : to)}
              </Heading>
            </Skeleton>

            <Skeleton isLoaded={!isLoading} width={isLoading && '64px'}>
              <Text fontSize="xs" textAlign="left" color="gray.500">
                {format(new Date(timestamp), 'h:mmaaa')}
              </Text>
            </Skeleton>
          </VStack>

          <Spacer />

          <VStack spacing="4px" alignItems="right">
            <Skeleton isLoaded={!isLoading}>
              <Text
                color={isReceiving && 'green.500'}
                fontSize="sm"
                textAlign="right"
                fontWeight="bold"
              >
                {sideEffect ? '-' : `${isReceiving ? '+ ' : ''}${displayUSDC(value)}`}
              </Text>
            </Skeleton>

            {isReceiving ? undefined : (
              <Skeleton isLoaded={!isLoading}>
                <Text fontSize="xs" textAlign="right" color="gray.500">
                  {displayUSDC(fee)} fee
                </Text>
              </Skeleton>
            )}
          </VStack>
        </HStack>
      </HStack>

      {extraLineItems.map((line, i) => {
        return (
          <HStack
            key={`extra-line-item-${i}`}
            as="button"
            _hover={{ bg: 'blue.100' }}
            onClick={onClick}
            w="100%"
            borderBottomRadius={isLastInList && i === extraLineItems.length - 1 && 'lg'}
          >
            <Icon as={AiOutlineExclamation} ml="14px" mr="8px" w="32px" h="32px" color="gray.300" />

            <HStack
              w="100%"
              py="8px"
              pr="16px"
              spacing="8px"
              borderBottomWidth={
                ((!isLastInSection && !isLastInList) || i !== extraLineItems.length - 1) && '1px'
              }
            >
              <Skeleton isLoaded={!isLoading} borderRadius="lg">
                <Avatar size="xs" borderRadius="lg" />
              </Skeleton>

              <Skeleton isLoaded={!isLoading}>
                <Text fontSize="xs" fontWeight="500" textAlign="left">
                  {line.sideEffect ?? (line.isReceiving ? line.from : line.to)}
                </Text>
              </Skeleton>

              <Spacer />

              <Skeleton isLoaded={!isLoading}>
                <Text
                  color={line.isReceiving && 'green.500'}
                  fontSize="xs"
                  textAlign="right"
                  fontWeight="500"
                >
                  {line.sideEffect
                    ? '-'
                    : `${line.isReceiving ? '+ ' : ''}${displayUSDC(line.value)}`}
                </Text>
              </Skeleton>
            </HStack>
          </HStack>
        );
      })}
    </>
  );
};
