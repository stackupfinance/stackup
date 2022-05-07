import * as React from 'react';
import {Box, Text, Button} from 'native-base';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SettingsStackParamList} from '../../config';

type Props = NativeStackScreenProps<SettingsStackParamList, 'Overview'>;

export default function OverviewScreen({navigation}: Props) {
  return (
    <Box flex={1} alignItems="center" justifyContent="center">
      <Text mb="16px" color="black">
        Settings {'>'} Overview Screen
      </Text>

      <Button onPress={() => navigation.goBack()}>Back to Home</Button>
    </Box>
  );
}
