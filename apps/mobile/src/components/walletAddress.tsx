import React from 'react';
import {VStack, Box, Input, Text, Pressable, useToast} from 'native-base';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faWallet} from '@fortawesome/free-solid-svg-icons/faWallet';
import hexToRgba from 'hex-to-rgba';
import Clipboard from '@react-native-clipboard/clipboard';
import {AppColors, Networks, NetworksConfig} from '../config';
import {truncate} from '../utils/address';

type Props = {
  value: string;
  network: Networks;
};

export const WalletAddress = ({value, network}: Props) => {
  const toast = useToast();

  const onCopyPress = () => {
    Clipboard.setString(value);
    toast.show({
      title: 'Wallet address copied',
      backgroundColor: AppColors.palettes.primary[600],
      placement: 'top',
    });
  };

  return (
    <VStack space="12px">
      <Input
        mt="34px"
        borderRadius="7px"
        value={truncate(value)}
        fontFamily="heading"
        fontSize="14px"
        editable={false}
        InputLeftElement={
          <Box ml="16px">
            <FontAwesomeIcon
              icon={faWallet}
              color={AppColors.text[5]}
              size={20}
            />
          </Box>
        }
        InputRightElement={
          <Pressable mr="7px" onPress={onCopyPress} my="7px">
            {({isPressed}) => (
              <Box
                w="80px"
                h="30px"
                justifyContent="center"
                alignItems="center"
                borderRadius="8px"
                backgroundColor={
                  isPressed
                    ? hexToRgba(AppColors.palettes.primary[600], 0.8)
                    : AppColors.palettes.primary[600]
                }>
                <Text fontSize="16px" color="text.1">
                  Copy
                </Text>
              </Box>
            )}
          </Pressable>
        }
      />

      <Text
        textAlign="center"
        fontFamily="heading"
        fontSize="13px"
        color="text.3">
        This address supports any asset on {NetworksConfig[network].name}.
      </Text>
    </VStack>
  );
};
