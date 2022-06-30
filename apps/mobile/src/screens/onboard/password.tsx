import React, {useState} from 'react';
import {Box, Button, Heading, Text, Image, Input, useToast} from 'native-base';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {faArrowLeft} from '@fortawesome/free-solid-svg-icons/faArrowLeft';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faKey} from '@fortawesome/free-solid-svg-icons/faKey';
import {OnboardStackParamList, AppColors} from '../../config';
import {
  StackScreenContainer,
  IconButton,
  Saly12Illustration,
} from '../../components';
import {
  useFingerprintStorePasswordSelector,
  useWalletStorePasswordSelector,
} from '../../state';
import {generateSalt} from '../../utils/random';
import {logEvent} from '../../utils/analytics';

type Props = NativeStackScreenProps<OnboardStackParamList, 'Password'>;

type Data = {
  password: string;
  confirmPassword: string;
};

export default function PasswordScreen({navigation, route}: Props) {
  const {setMasterPassword} = useFingerprintStorePasswordSelector();
  const {loading, create} = useWalletStorePasswordSelector();
  const toast = useToast();
  const [data, setData] = useState<Data>({
    password: '',
    confirmPassword: '',
  });
  const {enableFingerprint} = route.params;

  const onChangeTextHandler = (field: keyof Data) => (text: string) => {
    setData({...data, [field]: text});
  };

  const onBackPress = () => {
    logEvent('PASSWORD_BACK');
    navigation.goBack();
  };

  const navigateNextHandler = () => {
    const {password, confirmPassword} = data;

    if (!password || !confirmPassword) {
      toast.show({
        title: 'All fields are required',
        backgroundColor: AppColors.singletons.warning,
        placement: 'top',
      });
    } else if (password !== confirmPassword) {
      toast.show({
        title: "Passwords don't match",
        backgroundColor: AppColors.singletons.warning,
        placement: 'top',
      });
    } else {
      const salt = generateSalt();
      create(password, salt, async () => {
        logEvent('PASSWORD_CREATE_WALLET', {enableFingerprint});
        enableFingerprint && setMasterPassword(password, salt);
      });
    }
  };

  return (
    <StackScreenContainer>
      <IconButton icon={faArrowLeft} onPress={onBackPress} />

      <Heading mt="16px" fontWeight={600} fontSize="25px" textAlign="center">
        Set up your first layer of security
      </Heading>

      <Text mt="32px" fontSize="16px" color="text.3" textAlign="center">
        It's fast and it's easy. You'll see..
      </Text>

      <Box justifyContent="center" alignItems="center" w="100%">
        <Image
          mt="16px"
          source={Saly12Illustration}
          w="286px"
          h="245px"
          resizeMode="cover"
          alt="password-illustration"
        />
      </Box>

      <Text mt="16px" fontSize="16px" color="text.3" textAlign="center">
        Choose a strong password to protect yourself. We'll never have access to
        this.
      </Text>

      <Input
        mt="16px"
        type="password"
        placeholder="Current password..."
        onChangeText={onChangeTextHandler('password')}
        leftElement={
          <Box ml="13px">
            <FontAwesomeIcon icon={faKey} color={AppColors.text[5]} size={18} />
          </Box>
        }
      />

      <Input
        mt="16px"
        type="password"
        placeholder="Confirm password..."
        onChangeText={onChangeTextHandler('confirmPassword')}
        leftElement={
          <Box ml="13px">
            <FontAwesomeIcon icon={faKey} color={AppColors.text[5]} size={18} />
          </Box>
        }
      />

      <Button
        isLoading={loading}
        mt="16px"
        width="100%"
        onPress={navigateNextHandler}>
        Enter the crypto world
      </Button>

      <Text my="16px" fontSize="11px" fontFamily="heading" textAlign="center">
        You will be able to change this at a later stage
      </Text>
    </StackScreenContainer>
  );
}
