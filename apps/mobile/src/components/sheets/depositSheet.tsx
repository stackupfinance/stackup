import React from 'react';
import {VStack, Text} from 'native-base';
import {faArrowRight} from '@fortawesome/free-solid-svg-icons/faArrowRight';
import {BaseSheet} from '.';
import {MenuItem} from '..';
import RampSdk from '@ramp-network/react-native-sdk';

type Props = {
  isOpen: boolean;
  walletAddress: string;
  onTransferFromWalletPress: () => void;
  onClose: () => void;
};

export const DepositSheet = ({
  isOpen,
  walletAddress,
  onTransferFromWalletPress,
  onClose,
}: Props) => {
  const ramp = new RampSdk({
    // to do: add API key once received
    // hostApiKey: '',
    // Uncomment url property to enable test env
    url: 'https://ri-widget-staging.firebaseapp.com',
    hostAppName: 'Stackup',
    hostLogoUrl:
      'https://uploads-ssl.webflow.com/624b0f4c7d6e9823d82be059/624f2c74bc63300a38ab9a4f_logotype_blue_white.svg',
    defaultAsset: 'MATIC_USDC',
    fiatCurrency: 'USD',
    fiatValue: '10',
    userAddress: walletAddress,
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
