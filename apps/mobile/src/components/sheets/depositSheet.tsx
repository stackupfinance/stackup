import React from 'react';
import {VStack} from 'native-base';
import {faArrowRight} from '@fortawesome/free-solid-svg-icons/faArrowRight';
import {BaseSheet} from '.';
import {MenuItem} from '..';
import RampSdk from '@ramp-network/react-native-sdk';

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
  const ramp = new RampSdk({
    url: 'https://ri-widget-staging.firebaseapp.com',
    hostAppName: 'Stackup',
    hostLogoUrl: 'https://rampnetwork.github.io/assets/misc/test-logo.png',
  }).on('*', event => {
    console.log(`RampSdk.on('*')`, event);
  });
  return (
    <BaseSheet title="Deposit" isOpen={isOpen} onClose={onClose}>
      <VStack flex={1} p="24px" backgroundColor="background.1" space="11px">
        <MenuItem
          heading="Transfer from wallet"
          icon={faArrowRight}
          onPress={onTransferFromWalletPress}
        />
        <MenuItem
          heading="Deposit with Ramp"
          icon={faArrowRight}
          onPress={() => ramp?.show()}
        />
      </VStack>
    </BaseSheet>
  );
};
