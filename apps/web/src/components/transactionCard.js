import format from 'date-fns/format';
import { Heading, HStack, VStack, Avatar, Text, Icon, Spacer } from '@chakra-ui/react';
import { AiOutlineExclamation } from 'react-icons/ai';
import { displayUSDC } from '../utils/web3';

export const TransactionCard = ({
  // isLoading,
  isLastInSection,
  isLastInList,
  isIncoming,
  name,
  value,
  effect,
  fee,
  extraLineItems = [],
  timestamp,
  onClick = () => {},
}) => {
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
        <Avatar size="sm" borderRadius="lg" />

        <HStack
          w="100%"
          py="8px"
          pr="16px"
          borderBottomWidth={
            ((!isLastInSection && !isLastInList) || extraLineItems.length > 0) && '1px'
          }
        >
          <VStack spacing="4px" alignItems="left">
            <Heading fontSize="sm" textAlign="left">
              {effect ?? name}
            </Heading>

            <Text fontSize="xs" textAlign="left" color="gray.500">
              {format(new Date(timestamp), 'h:mmaaa')}
            </Text>
          </VStack>

          <Spacer />

          <VStack spacing="4px" alignItems="right">
            <Text
              color={isIncoming && 'green.500'}
              fontSize="sm"
              textAlign="right"
              fontWeight="bold"
            >
              {effect ? '-' : `${isIncoming ? '+ ' : ''}${displayUSDC(value)}`}
            </Text>

            {isIncoming ? undefined : (
              <Text fontSize="xs" textAlign="right" color="gray.500">
                {displayUSDC(fee)} fee
              </Text>
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
              <Avatar size="xs" borderRadius="lg" />

              <Text fontSize="xs" fontWeight="500" textAlign="left">
                {line.effect ?? line.name}
              </Text>

              <Spacer />

              <Text
                color={line.isIncoming && 'green.500'}
                fontSize="xs"
                textAlign="right"
                fontWeight="500"
              >
                {line.effect ? '-' : `${line.isIncoming ? '+ ' : ''}${line.value}`}
              </Text>
            </HStack>
          </HStack>
        );
      })}
    </>
  );
};
