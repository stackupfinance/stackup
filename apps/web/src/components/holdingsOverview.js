import { Stat, StatLabel, StatNumber, Skeleton, Heading, Box } from '@chakra-ui/react';
import { displayUSDC } from '../utils/web3';

export const HoldingsOverview = ({ isLoading, username, totalEquityUsdc }) => {
  return (
    <Box w="100%">
      <Heading
        borderWidth="1px"
        borderBottomWidth="0px"
        borderTopRadius="lg"
        bg="blue.50"
        textAlign="left"
        p="16px"
        size="md"
      >
        <Skeleton
          width={isLoading && '144px'}
          isLoaded={!isLoading}
          borderRadius="lg"
          startColor="blue.500"
          endColor="blue.50"
        >
          Gm{username ? `, ${username}` : ''} ☀️
        </Skeleton>
      </Heading>

      <Stat
        borderWidth="1px"
        borderTopWidth="0px"
        borderBottomRadius="lg"
        bg="white"
        p="16px"
        textAlign="left"
      >
        <StatLabel fontSize="md">Total equity</StatLabel>

        <Skeleton isLoaded={!isLoading} borderRadius="lg">
          <StatNumber>{displayUSDC(totalEquityUsdc)}</StatNumber>
        </Skeleton>
      </Stat>
    </Box>
  );
};
