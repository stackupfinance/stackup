import * as React from 'react';
import {Box, Text} from 'native-base';
import type {MaterialTopTabScreenProps} from '@react-navigation/material-top-tabs';
import {HomeTabParamList} from '../../config';

type Props = MaterialTopTabScreenProps<HomeTabParamList, 'History'>;

export default function HistoryScreen({}: Props) {
  return (
    <Box flex={1} alignItems="center" justifyContent="center">
      <Text mb="16px" color="black">
        History Tab
      </Text>
    </Box>
  );
}
