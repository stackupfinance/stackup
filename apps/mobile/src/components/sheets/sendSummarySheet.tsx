import React from 'react';
import {Box, VStack, Heading, Text, Button} from 'native-base';
import {ethers, BigNumberish} from 'ethers';
import {faArrowUp} from '@fortawesome/free-solid-svg-icons/faArrowUp';
import {BaseSheet} from '.';
import {ImageWithIconBadge, SummaryTable} from '..';
import {
  CurrencySymbols,
  Networks,
  CurrencyMeta,
  NetworksConfig,
  AppColors,
  Fee,
} from '../../config';
import {formatCurrency} from '../../utils/currency';
import {truncate} from '../../utils/address';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  fromAddress: string;
  toAddress: string;
  value: BigNumberish;
  fee: Fee;
  currency: CurrencySymbols;
  currencyBalances: Partial<Record<CurrencySymbols, BigNumberish>>;
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
  currencyBalances,
  network,
}: Props) => {
  const hasInsufficientFunds =
    currency === fee.currency
      ? ethers.BigNumber.from(currencyBalances[currency]).lt(
          ethers.BigNumber.from(value).add(fee.value),
        )
      : ethers.BigNumber.from(currencyBalances[currency]).lt(value);
  const hasInsufficientFee =
    currency === fee.currency
      ? hasInsufficientFunds
      : ethers.BigNumber.from(currencyBalances[fee.currency]).lt(fee.value);
  const isDisabled = hasInsufficientFunds || hasInsufficientFee;

  const renderError = () => {
    let message;
    if (hasInsufficientFunds) {
      message = `Not enough ${CurrencyMeta[currency].name} for this transaction`;
    } else if (hasInsufficientFee) {
      message = `Not enough ${CurrencyMeta[currency].name} to pay fees`;
    }

    return message ? (
      <Text mt="8px" fontWeight={600} color={AppColors.singletons.warning}>
        {message}
      </Text>
    ) : undefined;
  };

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

        {renderError()}

        <Box flex={1} />

        <Button isDisabled={isDisabled} w="100%" onPress={() => {}}>
          Send
        </Button>
      </VStack>
    </BaseSheet>
  );
};
