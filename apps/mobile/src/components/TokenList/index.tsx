import React from 'react';
import {
  Box,
  FlatList,
  Text,
  HStack,
  VStack,
  Code,
  Spacer
} from "native-base";

const TokenList = () => {
  const tokenData = [
    { 
      name: 'Bitcoin',
      id: '1',
      value: '1.332 BTC',
      valueUSDC: '$52,472'
    },
    { 
      name: 'Ethereum',
      id: '2',
      value: '8.123 ETH',
      valueUSDC: '$20,504'
    },
    { 
      name: 'USDC',
      id: '3',
      value: '24,300 USDC',
      valueUSDC: '$24,180'
    },
  ];

  return (
    <Box>
      <FlatList data={tokenData} renderItem={({ item }) => 
        <Box borderBottomWidth="1" _dark={{ borderColor: "gray.600" }} borderColor="coolGray.200" pl="4" pr="5" py="2">
          <HStack space={3} justifyContent="space-between">
            <Text>Logo</Text>
            <VStack>
              <Text _dark={{ color: "warmGray.50" }} color="coolGray.800" bold>
                {item.name}
              </Text>
              <Text color="coolGray.600" _dark={{ color: "warmGray.200" }}>
                {item.value}
              </Text>
            </VStack>
            <Spacer />
            <Text fontSize="xs" _dark={{ color: "warmGray.50" }} color="coolGray.800" alignSelf="flex-start">
              {item.valueUSDC}
            </Text>
          </HStack>
        </Box>} keyExtractor={item => item.id} />
    </Box>
  );
};

export default TokenList;