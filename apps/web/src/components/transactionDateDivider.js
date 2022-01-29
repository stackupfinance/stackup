import format from 'date-fns/format';
import { Text, Skeleton } from '@chakra-ui/react';

export const TransactionDateDivider = ({ isLoading, timestamp }) => {
  return (
    <Text as="div" bg="gray.50" textAlign="left" p="8px" fontWeight="500" fontSize="sm">
      <Skeleton isLoaded={!isLoading} width={isLoading && '128px'}>
        <Text>{format(new Date(timestamp), 'EEE, d MMMM')}</Text>
      </Skeleton>
    </Text>
  );
};
