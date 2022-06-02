import React from 'react';
import {Dimensions} from 'react-native';
import {HStack, VStack, Popover, Button, Divider, Text} from 'native-base';
import {faArrowUpRightFromSquare} from '@fortawesome/free-solid-svg-icons/faArrowUpRightFromSquare';
import {faDiscord} from '@fortawesome/free-brands-svg-icons/faDiscord';
import {BaseSheet} from '.';
import {MenuItem} from '..';
import {AppColors} from '../../config';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onHelpPress: () => void;
  onDiscordPress: () => void;
  onRemoveWalletPress: () => void;
};

export const SettingsSheet = ({
  isOpen,
  onClose,
  onHelpPress,
  onDiscordPress,
  onRemoveWalletPress,
}: Props) => {
  const popOverWidth = Dimensions.get('window').width - 48;
  return (
    <BaseSheet title="Settings" isOpen={isOpen} onClose={onClose}>
      <VStack flex={1} p="24px" backgroundColor="background.1" space="11px">
        <MenuItem
          heading="Help & Support"
          icon={faArrowUpRightFromSquare}
          onPress={onHelpPress}
        />

        <MenuItem
          heading="Join Stackup community"
          description="We're not big yet, but we like to make new friends :)"
          backgroundColor={AppColors.palettes.primary[600]}
          icon={faDiscord}
          onPress={onDiscordPress}
        />

        <Divider />

        <Popover
          trigger={triggerProps => (
            <Button
              {...triggerProps}
              size="sm"
              colorScheme="tertiary"
              variant="outline"
              borderColor="tertiary.600">
              Remove Wallet
            </Button>
          )}>
          <Popover.Content
            accessibilityLabel="Remove Wallet"
            borderWidth="0px"
            top="8px"
            w={popOverWidth}>
            <Popover.CloseButton />
            <Popover.Header
              backgroundColor="background.3"
              borderColor="background.3">
              Are you sure?
            </Popover.Header>
            <Popover.Body backgroundColor="background.2">
              <VStack space="16px">
                <Text fontSize="14px">
                  This will remove your wallet from this device. Make sure to
                  check your security options if you still want to keep access
                  for later.
                </Text>

                <HStack justifyContent="flex-end">
                  <Button
                    size="xs"
                    colorScheme="tertiary"
                    variant="outline"
                    borderColor="tertiary.600"
                    onPress={onRemoveWalletPress}>
                    Confirm
                  </Button>
                </HStack>
              </VStack>
            </Popover.Body>
          </Popover.Content>
        </Popover>
      </VStack>
    </BaseSheet>
  );
};
