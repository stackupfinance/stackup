import format from 'date-fns/format';
import { Text } from '@chakra-ui/react';

export const TransactionDateDivider = ({ timestamp }) => {
  return (
    <Text bg="gray.50" textAlign="left" p="8px" fontWeight="500" fontSize="sm">
      {format(new Date(timestamp), 'EEE, d MMMM')}
    </Text>
  );
};
