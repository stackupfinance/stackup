import React from 'react';
import {VStack, HStack, Text, Skeleton} from 'native-base';

interface Props {
  rows: Array<{
    key: string;
    value: string;
    isLoading?: boolean;
    color?: string;
  }>;
}

export const SummaryTable = ({rows}: Props) => {
  return (
    <VStack
      w="100%"
      py="12px"
      px="22px"
      space="18px"
      backgroundColor="background.3"
      borderRadius="8px"
      justifyContent="center"
      alignItems="center">
      {rows.map(row => (
        <HStack
          key={`summary-${row.key}-${row.value}`}
          w="100%"
          justifyContent="space-between"
          alignItems="center">
          <Text fontSize="14px" fontWeight={400} color={row.color ?? 'text.3'}>
            {row.key}
          </Text>
          <Skeleton.Text isLoaded={!row.isLoading} lines={1} w="64px">
            <Text fontSize="16px" fontWeight={500} color={row.color ?? 'white'}>
              {row.value}
            </Text>
          </Skeleton.Text>
        </HStack>
      ))}
    </VStack>
  );
};
