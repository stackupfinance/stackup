import * as React from 'react';
import {Box, Heading, Text, Button, VStack} from 'native-base';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SettingsStackParamList} from '../../config';
import {ScreenContainer, ScreenHeader} from '../../components';

type Props = NativeStackScreenProps<SettingsStackParamList, 'Overview'>;

export default function OverviewScreen({navigation}: Props) {
  return (
    <ScreenContainer>
      <ScreenHeader>
        <Heading fontSize="16px" fontFamily="heading">
          Security
        </Heading>
      </ScreenHeader>
      <Box justifyContent="center">
        <Text mb="16px">Settings {'>'} Overview Screen</Text>
        <VStack space={3} mx="4">
          <Button>Currency</Button>
          <Button>Help &amp; Support</Button>
          <Button>Join Stackup Community</Button>
        </VStack>
        <Button mx="4" my="4" onPress={() => navigation.goBack()}>Back to Home</Button>
      </Box>
    </ScreenContainer>
  );
}
