import React from 'react';
import {Box, Image, HStack} from 'native-base';

type ListItemProps = {
  data: any;
  children: React.ReactNode;
};

const ListItem = (props: ListItemProps) => {
  const {data} = props;
  return (
    <Box bg="background.3" borderRadius="lg" pl="4" pr="5" py="2" my="1" mx="3">
      <HStack space={3} justifyContent="space-between">
        <Image
          source={data.imgSrc}
          alt={data.name}
          size="xl"
          width="40px"
          height="40px"
        />
        {props.children}
      </HStack>
    </Box>
  );
};

export default ListItem;
