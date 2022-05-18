import * as React from 'react';
import {Box, Heading, Button} from 'native-base';
import type {CompositeScreenProps} from '@react-navigation/native';
import type {MaterialTopTabScreenProps} from '@react-navigation/material-top-tabs';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList, HomeTabParamList} from '../../config';
import {useRemoveWallet} from '../../hooks';
import {ScreenContainer, ScreenHeader} from '../../components';
import {useIntercomStoreSettingsSelector} from '../../state';

type Props = CompositeScreenProps<
  MaterialTopTabScreenProps<HomeTabParamList, 'Assets'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function AssetsScreen({navigation}: Props) {
  const removeWallet = useRemoveWallet();
  const {openMessenger} = useIntercomStoreSettingsSelector();

  return (
    <ScreenContainer>
      <ScreenHeader>
        <Heading fontSize="16px" fontFamily="heading">
          Assets
        </Heading>
      </ScreenHeader>

      <Box flex={1} alignItems="center" justifyContent="center">
        <Button mb="16px" onPress={() => navigation.navigate('Security')}>
          Security Overview
        </Button>

        <Button
          mb="16px"
          colorScheme="secondary"
          onPress={() => navigation.navigate('Settings')}>
          Settings Overview
        </Button>

        <Button mb="16px" colorScheme="secondary" onPress={openMessenger}>
          Display messenger
        </Button>

        <Button colorScheme="tertiary" onPress={removeWallet}>
          Remove wallet
        </Button>
      </Box>
    </ScreenContainer>
  );
}
