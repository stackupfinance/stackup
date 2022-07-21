import React from 'react';
import {Box, Image, Spinner, Button, Heading, Text} from 'native-base';
import {BaseSheet} from '.';
import {SessionRequestPayload} from '../../config';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  payload?: SessionRequestPayload;
};

export const WalletConnectSessionRequestSheet = ({
  isOpen,
  onClose,
  onApprove,
  payload,
}: Props) => {
  return (
    <BaseSheet title="Approve connection" isOpen={isOpen} onClose={onClose}>
      {payload ? (
        <Box flex={1} mt="54px" pb="47px" px="18px" alignItems="center">
          <Image
            w="68px"
            h="68px"
            source={{uri: payload.params[0]?.peerMeta.icons[0]}}
            alt="walletconnect-app-icon"
          />

          <Heading
            mt="18px"
            fontSize="34px"
            fontWeight={600}
            textAlign="center">
            {payload.params[0]?.peerMeta.name}
          </Heading>

          <Text
            mt="18px"
            fontSize="16px"
            fontWeight={500}
            color="text.3"
            textAlign="center">
            {payload.params[0]?.peerMeta.description}
          </Text>

          <Box flex={1} />

          <Button w="100%" onPress={onApprove}>
            Approve
          </Button>
        </Box>
      ) : (
        <Box flex={1} px="18px" justifyContent="center" alignItems="center">
          <Spinner size="lg" />
        </Box>
      )}
    </BaseSheet>
  );
};
