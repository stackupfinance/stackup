import * as React from 'react';
import {Box, Text} from 'native-base';
import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {HomeTabParamList} from '../../config';

type Props = BottomTabScreenProps<HomeTabParamList, 'Earn'>;

export default function EarnScreen({}: Props) {
  return (
    <Box flex={1} alignItems="center" justifyContent="center">
      <Text mb="16px" color="black">
        Earn Tab
      </Text>
    </Box>
  );
}
