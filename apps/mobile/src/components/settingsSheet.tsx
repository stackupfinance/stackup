import React from 'react';
import {VStack, Button, Divider} from 'native-base';
import {faArrowUpRightFromSquare} from '@fortawesome/free-solid-svg-icons/faArrowUpRightFromSquare';
import {faDiscord} from '@fortawesome/free-brands-svg-icons/faDiscord';
import {MenuItem, BaseSheet} from '.';
import {AppColors} from '../config';

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
          description="We’re not big yet, but we like to make new friends :)"
          backgroundColor={AppColors.palettes.primary[600]}
          icon={faDiscord}
          onPress={onDiscordPress}
        />

        <Divider />

        <Button colorScheme="tertiary" onPress={onRemoveWalletPress}>
          Remove Wallet
        </Button>
      </VStack>
    </BaseSheet>
  );
};
