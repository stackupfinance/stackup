import * as React from 'react';
import {Box, Text, Button} from 'native-base';
import type {CompositeScreenProps} from '@react-navigation/native';
import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList, HomeTabParamList} from '../../config';
import {useLogout} from '../../hooks';
import {useAuthStoreAssetsSelector} from '../../state';

type Props = CompositeScreenProps<
  BottomTabScreenProps<HomeTabParamList, 'Assets'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function AssetsScreen({navigation}: Props) {
  const logout = useLogout();
  const {loading} = useAuthStoreAssetsSelector();

  return (
    <Box flex={1} alignItems="center" justifyContent="center">
      <Text mb="16px" color="black">
        Assets Tab
      </Text>

      <Button mb="16px" onPress={() => navigation.navigate('Security')}>
        Security Overview
      </Button>

      <Button mb="16px" onPress={() => navigation.navigate('Settings')}>
        Settings Overview
      </Button>

      <Button isLoading={loading} onPress={logout}>
        Logout
      </Button>
    </Box>
  );
}
