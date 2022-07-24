import React, {useState} from 'react';
import {Box, Heading, Input, Text, Button, useToast} from 'native-base';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faKey} from '@fortawesome/free-solid-svg-icons/faKey';
import {BaseSheet} from '.';
import {AppColors} from '../../config';

type Props = {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onBack: () => void;
  onSubmit: (password: string, newPassword: string) => void;
};

type Data = {
  password: string;
  newPassword: string;
  confirmPassword: string;
};

export const PasswordSheet = ({
  isOpen,
  isLoading,
  onClose,
  onBack,
  onSubmit,
}: Props) => {
  const toast = useToast();
  const [data, setData] = useState<Data>({
    password: '',
    newPassword: '',
    confirmPassword: '',
  });

  const onChangeTextHandler = (field: keyof Data) => (text: string) => {
    setData({...data, [field]: text});
  };

  const onPress = () => {
    const {password, newPassword, confirmPassword} = data;

    if (!password || !newPassword || !confirmPassword) {
      toast.show({
        title: 'All fields are required',
        backgroundColor: AppColors.singletons.warning,
        placement: 'top',
      });
    } else if (newPassword !== confirmPassword) {
      toast.show({
        title: "Passwords don't match",
        backgroundColor: AppColors.singletons.warning,
        placement: 'top',
      });
    } else {
      onSubmit(password, newPassword);
    }
  };

  return (
    <BaseSheet
      title="Password"
      isOpen={isOpen}
      onClose={onClose}
      onBack={onBack}>
      <Box height="100%" pt="36px" pb="47px" px="18px" alignItems="center">
        <Heading fontWeight={600} fontSize="25px" textAlign="center">
          Change Password
        </Heading>

        <Input
          mt="51px"
          type="password"
          placeholder="Current password..."
          onChangeText={onChangeTextHandler('password')}
          leftElement={
            <Box ml="13px">
              <FontAwesomeIcon
                icon={faKey}
                color={AppColors.text[5]}
                size={18}
              />
            </Box>
          }
        />

        <Text mt="9px" fontWeight={600} fontSize="18px" color="text.5" w="100%">
          New Password
        </Text>

        <Input
          mt="9px"
          type="password"
          placeholder="New password..."
          onChangeText={onChangeTextHandler('newPassword')}
          leftElement={
            <Box ml="13px">
              <FontAwesomeIcon
                icon={faKey}
                color={AppColors.text[5]}
                size={18}
              />
            </Box>
          }
        />

        <Input
          mt="12px"
          type="password"
          placeholder="Confirm new password..."
          onChangeText={onChangeTextHandler('confirmPassword')}
          leftElement={
            <Box ml="13px">
              <FontAwesomeIcon
                icon={faKey}
                color={AppColors.text[5]}
                size={18}
              />
            </Box>
          }
        />

        <Box flex={1} />

        <Button isLoading={isLoading} w="100%" onPress={onPress}>
          Change password
        </Button>
      </Box>
    </BaseSheet>
  );
};
