import React from 'react';
import {Icon, Input, VStack} from 'native-base';

const SearchBar = () => {
  return (
    <VStack w="100%" space={5} alignSelf="center" my="5" px="4">
      <Input
        placeholder="Search..."
        width="100%"
        borderRadius="lg"
        py="3"
        px="1"
        fontSize="14"
        InputLeftElement={<Icon m="2" ml="3" size="6" color="gray.400" />}
      />
    </VStack>
  );
};

export default SearchBar;
