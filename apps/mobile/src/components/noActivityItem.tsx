import React from 'react';
import {VStack, Text} from 'native-base';
import {BaseItem} from '.';

type Props = {};

export const NoActivityItem = ({}: Props) => {
  return (
    <BaseItem alt="no-activity-item">
      <VStack>
        <Text fontWeight={500} fontSize="16px">
          No activity yet...
        </Text>

        <Text color="text.3">Make your first transaction to get started!</Text>
      </VStack>
    </BaseItem>
  );
};
