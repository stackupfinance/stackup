import React from 'react';
import {
  Box,
  Text,
  HStack,
  VStack,
  Spacer
} from "native-base";

type ListItemProps = {
  data: any;
}

const ListItem = (props: ListItemProps) => {
  const { data } = props;
  const changeValueIndicator = (data.valueChange > 0) ? '+' : '-';
  return (
    <Box bg="background.3" borderRadius="lg" pl="4" pr="5" py="2" my="1" mx="3">
      <HStack space={3} justifyContent="space-between">
        <Text>Logo</Text>
        <VStack>
          <Text color="text.1" bold>
            {data.name}
          </Text>
          <Text color="text.3">
            {data.value}
          </Text>
        </VStack>
        <Spacer />
        <VStack>
          <Text color="text.1">
            {data.valueUSDC}
          </Text>
          <HStack>
            <Text color="#1ED759">
              {data.percentChange}%
            </Text>
            <Text>
              {changeValueIndicator}{data.valueChange}{' '}
            </Text>
          </HStack>
        </VStack>
      </HStack>
    </Box>
  );
};

export default ListItem;