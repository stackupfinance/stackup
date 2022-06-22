import React from 'react';
import {Box, VStack, Heading, Button} from 'native-base';
import {BigNumberish} from 'ethers';
import {faArrowUp} from '@fortawesome/free-solid-svg-icons/faArrowUp';
import {BaseSheet} from '.';
import {ImageWithIconBadge, SummaryTable} from '..';
import {
  CurrencySymbols,
  Networks,
  CurrencyMeta,
  NetworksConfig,
} from '../../config';
import {formatCurrency} from '../../utils/currency';
import {truncate} from '../../utils/address';

type Fee = {
  value: BigNumberish;
  currency: CurrencySymbols;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  fromAddress: string;
  toAddress: string;
  value: BigNumberish;
  fee: Fee;
  currency: CurrencySymbols;
  network: Networks;
};

export const SendSummarySheet = ({
  isOpen,
  onClose,
  onBack,
  fromAddress,
  toAddress,
  value,
  fee,
  currency,
  network,
}: Props) => {
  return (
    <BaseSheet
      title="Summary"
      isOpen={isOpen}
      onClose={onClose}
      onBack={onBack}>
      <VStack
        flex={1}
        pt="30px"
        pb="24px"
        px="18px"
        justifyContent="center"
        alignItems="center">
        <ImageWithIconBadge
          key={`send-summary-${currency}-logo`}
          source={CurrencyMeta[currency].logo}
          icon={faArrowUp}
        />

        <Heading
          mt="18px"
          mb="34px"
          fontSize="39px"
          fontWeight={600}
          textAlign="center">
          {formatCurrency(value, currency)}
        </Heading>

        <SummaryTable
          rows={[
            {key: 'From', value: truncate(fromAddress)},
            {key: 'To', value: truncate(toAddress)},
            {key: 'Fee', value: formatCurrency(fee.value, fee.currency)},
            {
              key: 'Network',
              value: NetworksConfig[network].name,
              color: NetworksConfig[network].color,
            },
          ]}
        />

        <Box flex={1} />

        <Button w="100%" onPress={() => {}}>
          Send
        </Button>
      </VStack>
    </BaseSheet>
  );
};
