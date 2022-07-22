import React from 'react';
import {Box, Image, Spinner, Button, Heading, VStack, Text} from 'native-base';
import WalletConnect from '@walletconnect/client';
import {BaseSheet} from '.';
import {CallRequestPayloads} from '../../config';
import {decodeMessage} from '../../utils/walletconnect';

type Props = {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onApprove: () => Promise<void>;
  connector?: WalletConnect;
  payload?: CallRequestPayloads;
};

export const WalletConnectSignSheet = ({
  isOpen,
  isLoading,
  onClose,
  onApprove,
  connector,
  payload,
}: Props) => {
  return (
    <BaseSheet title="Sign message" isOpen={isOpen} onClose={onClose}>
      {connector && payload?.method === 'personal_sign' ? (
        <Box flex={1} py="40px" px="18px" alignItems="center">
          <Image
            w="68px"
            h="68px"
            source={{uri: connector.peerMeta?.icons[0]}}
            alt="walletconnect-app-icon"
          />

          <Heading
            mt="18px"
            fontSize="34px"
            fontWeight={600}
            textAlign="center">
            {connector.peerMeta?.name}
          </Heading>

          <Box>
            <VStack
              mt="18px"
              p="16px"
              backgroundColor="background.3"
              borderRadius="16px">
              {decodeMessage(payload.params[0])
                .split('\n')
                .map((str, i) => (
                  <Text key={`sign-message-${i}`}>{str}</Text>
                ))}
            </VStack>
          </Box>

          <Box flex={1} />

          <Button isLoading={isLoading} mt="18px" w="100%" onPress={onApprove}>
            Sign
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
