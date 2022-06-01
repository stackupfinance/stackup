import React from 'react';
import {VStack} from 'native-base';
import {faArrowRight} from '@fortawesome/free-solid-svg-icons/faArrowRight';
import {BaseSheet} from '.';
import {MenuItem} from '..';

type Props = {
  isOpen: boolean;
  onTransferFromWalletPress: () => void;
  onClose: () => void;
};

export const DepositSheet = ({
  isOpen,
  onTransferFromWalletPress,
  onClose,
}: Props) => {
  return (
    <BaseSheet title="Deposit" isOpen={isOpen} onClose={onClose}>
      <VStack flex={1} p="24px" backgroundColor="background.1" space="11px">
        <MenuItem
          heading="Transfer from wallet"
          icon={faArrowRight}
          onPress={onTransferFromWalletPress}
        />
      </VStack>
    </BaseSheet>
  );
};
