import React, {PropsWithChildren, ReactElement} from 'react';
import {Box, FlatList, Text} from 'native-base';

type Props = {
  items: Array<ReactElement>;
  title?: string;
};

export const List = ({items, title}: PropsWithChildren<Props>) => {
  return (
    <>
      <Box w="100%">
        {title && (
          <Text fontWeight={600} fontSize="18px" color="text.5" mb="6px">
            {title}
          </Text>
        )}
      </Box>
      <FlatList
        w="100%"
        data={items}
        renderItem={({item, index}) => {
          return <Box mt={index > 0 ? '8px' : undefined}>{item}</Box>;
        }}
      />
    </>
  );
};
