import React from 'react';
import {Box, Heading, Text, Button, Image} from 'native-base';
import {BaseSheet} from '.';
import {Saly26Illustration} from '..';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onDiscordPress: () => void;
};

export const EmailConfirmedSheet = ({
  isOpen,
  onClose,
  onSubmit,
  onDiscordPress,
}: Props) => {
  return (
    <BaseSheet title="Email" isOpen={isOpen} onClose={onClose}>
      <Box height="100%" pt="36px" pb="47px" px="18px" alignItems="center">
        <Heading fontWeight={600} fontSize="25px" textAlign="center">
          Your email has been verified!
        </Heading>

        <Image
          mt="37px"
          source={Saly26Illustration}
          w="286px"
          h="270px"
          borderRadius="8px"
          alt="email-verification-illustration"
        />

        <Text mt="24px" fontSize="16px" color="text.3" textAlign="center">
          Got questions about Crypto? We'd love to get a chat going with you!
        </Text>

        <Button
          mt="13px"
          w="100%"
          variant="link"
          onPress={onDiscordPress}
          _text={{textAlign: 'center', fontWeight: 600, fontSize: '14px'}}>
          {'Come say hello on Discord :)'}
        </Button>

        <Box flex={1} />

        <Button mt="24px" w="100%" onPress={onSubmit}>
          Go back to wallet
        </Button>
      </Box>
    </BaseSheet>
  );
};
