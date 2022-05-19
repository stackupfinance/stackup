import React from 'react';
import {
  Box,
  FlatList,
  Text,
} from "native-base";
import ListItem from '../ListItem';
import { TokenListItem, NFTListItem } from '../../types/Assets';

type ListItemType = TokenListItem | NFTListItem;

type ListProps<T> = {
  data: Array<T>;
  title?: string;
}

const List = (props: ListProps<ListItemType>) => {
  const { data, title } = props;
  return (
    <Box>
      {
        title && <Text fontSize="xl" color="text.5">{title}</Text>
      }
      <FlatList 
        data={data} 
        renderItem={({ item }) => <ListItem data={item} />} 
      />
    </Box>
  );
};

export default List;