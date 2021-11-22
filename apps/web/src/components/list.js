import { Heading, Box, Spinner } from '@chakra-ui/react';
import InfiniteScroll from 'react-infinite-scroll-component';

export const List = ({ items = [], hasMore, next, listHeading, emptyHeading }) => {
  return (
    <>
      {items.length > 0 && listHeading && (
        <Heading textAlign="left" size="sm">
          {listHeading}
        </Heading>
      )}
      <Box mt="8px">
        {(items.length > 0 && (
          <InfiniteScroll
            dataLength={items.length}
            next={next}
            hasMore={hasMore}
            loader={<Spinner mt="16px" color="blue.500" />}
          >
            {items}
          </InfiniteScroll>
        )) || (
          <Heading size="md" px="16px" py="128px" color="gray.500" textAlign="center">
            {emptyHeading}
          </Heading>
        )}
      </Box>
    </>
  );
};
