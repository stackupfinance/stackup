import React, {useState} from 'react';
import {Box, Heading, Input, Text, Button, useToast} from 'native-base';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faAt} from '@fortawesome/free-solid-svg-icons/faAt';
import {BaseSheet} from '.';
import {AppColors} from '../../config';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

type Data = {
  email: string;
};

export const EmailSheet = ({isOpen, onClose, onSubmit}: Props) => {
  const toast = useToast();
  const [data, setData] = useState<Data>({
    email: '',
  });

  const onChangeTextHandler = (field: keyof Data) => (text: string) => {
    setData({...data, [field]: text});
  };

  const onPress = () => {
    const {email} = data;

    if (!email) {
      toast.show({
        title: 'All fields are required',
        backgroundColor: AppColors.singletons.warning,
        placement: 'top',
      });
    } else {
      onSubmit();
    }
  };

  return (
    <BaseSheet title="Email" isOpen={isOpen} onClose={onClose}>
      <Box height="100%" pt="36px" pb="47px" px="18px" alignItems="center">
        <Heading fontWeight={600} fontSize="25px" textAlign="center">
          Link your Email and Crypto account together
        </Heading>

        <Text mt="23px" fontSize="16px" color="text.3" textAlign="center">
          Your email address is how you will retrieve your wallet if you ever
          forget your wallet address
        </Text>

        <Input
          mt="26px"
          placeholder="Enter your email address.."
          keyboardType="email-address"
          onChangeText={onChangeTextHandler('email')}
          leftElement={
            <Box ml="13px">
              <FontAwesomeIcon
                icon={faAt}
                color={AppColors.text[5]}
                size={18}
              />
            </Box>
          }
        />

        <Box flex={1} />

        <Button w="100%" onPress={onPress}>
          Verify email address
        </Button>
      </Box>
    </BaseSheet>
  );
};
