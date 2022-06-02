import React, {useState} from 'react';
import {Box, Heading, Input, Text, Button, useToast, Image} from 'native-base';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faCode} from '@fortawesome/free-solid-svg-icons/faCode';
import {BaseSheet} from '.';
import {Saly10Illustration} from '..';
import {AppColors} from '../../config';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onSubmit: () => void;
};

type Data = {
  code: string;
};

export const VerifyEmailSheet = ({
  isOpen,
  onClose,
  onBack,
  onSubmit,
}: Props) => {
  const toast = useToast();
  const [data, setData] = useState<Data>({
    code: '',
  });

  const onChangeTextHandler = (field: keyof Data) => (text: string) => {
    setData({...data, [field]: text});
  };

  const onPress = () => {
    const {code} = data;

    if (!code) {
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
    <BaseSheet title="Email" isOpen={isOpen} onClose={onClose} onBack={onBack}>
      <Box height="100%" pt="36px" pb="47px" px="18px" alignItems="center">
        <Heading fontWeight={600} fontSize="25px" textAlign="center">
          An email confirmation has been sent to your inbox
        </Heading>

        <Text mt="23px" fontSize="16px" color="text.3" textAlign="center">
          You should have received an email with a verification code. Check spam
          folder if you aren't receiving it.
        </Text>

        <Input
          mt="22px"
          keyboardType="number-pad"
          placeholder="Type in your confirmation code..."
          onChangeText={onChangeTextHandler('code')}
          leftElement={
            <Box ml="13px">
              <FontAwesomeIcon
                icon={faCode}
                color={AppColors.text[5]}
                size={18}
              />
            </Box>
          }
        />

        <Image
          mt="20px"
          source={Saly10Illustration}
          w="286px"
          h="245px"
          borderRadius="8px"
          alt="email-verification-illustration"
        />

        <Button
          mt="23px"
          w="100%"
          variant="link"
          onPress={() => {}}
          _text={{textAlign: 'center', fontWeight: 600, fontSize: '14px'}}>
          Not receiving the email? Click here to send another one
        </Button>

        <Box flex={1} />

        <Button mt="24px" w="100%" onPress={onPress}>
          Verify email address
        </Button>
      </Box>
    </BaseSheet>
  );
};
