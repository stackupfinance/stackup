import * as React from 'react';
import {Box, Text, Button} from 'native-base';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {OnboardStackParamList} from '../../config';
import {useAuthStoreLoginSelector} from '../../state';

type Props = NativeStackScreenProps<OnboardStackParamList, 'Login'>;

export default function LoginScreen({}: Props) {
  const {loading, login} = useAuthStoreLoginSelector();

  return (
    <Box flex={1} alignItems="center" justifyContent="center">
      <Text mb="16px" color="black">
        Login Screen
      </Text>

      <Button isLoading={loading} onPress={login}>
        Login
      </Button>
    </Box>
  );
}
