import React from 'react';
import {Box, Image, Spinner, Button, Heading, Text} from 'native-base';
import WalletConnect from '@walletconnect/client';
import {ethers} from 'ethers';
import {BaseSheet} from '.';
import {SummaryTable} from '..';
import {
  CallRequestPayloads,
  CurrencySymbols,
  CurrencyBalances,
  CurrencyMeta,
  PaymasterStatus,
  AppColors,
} from '../../config';
import {formatCurrency} from '../../utils/currency';

type Props = {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onApprove: () => Promise<void>;
  defaultCurrency: CurrencySymbols;
  currencyBalances: CurrencyBalances;
  paymasterStatus?: PaymasterStatus;
  connector?: WalletConnect;
  payload?: CallRequestPayloads;
};

export const WalletConnectTransactionSheet = ({
  isOpen,
  isLoading,
  onClose,
  onApprove,
  defaultCurrency,
  currencyBalances,
  paymasterStatus,
  connector,
  payload,
}: Props) => {
  const feeValue = paymasterStatus?.fees[defaultCurrency] ?? '0';
  const defaultCurrencyBalance = currencyBalances[defaultCurrency] ?? '0';
  const hasInsufficientFee = ethers.BigNumber.from(defaultCurrencyBalance).lt(
    feeValue,
  );
  const isDisabled = hasInsufficientFee;

  const renderError = () => {
    let message;
    if (hasInsufficientFee) {
      message = `Not enough ${CurrencyMeta[defaultCurrency].name} to pay fees`;
    }

    return message ? (
      <Text mt="8px" fontWeight={600} color={AppColors.singletons.warning}>
        {message}
      </Text>
    ) : undefined;
  };

  return (
    <BaseSheet title="Approve transaction" isOpen={isOpen} onClose={onClose}>
      {connector && payload?.method === 'eth_sendTransaction' ? (
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

          <Box w="100%" mt="18px">
            <SummaryTable
              rows={[
                {
                  key: 'Details',
                  value: `See ${connector.peerMeta?.name ?? 'app'}`,
                },
                {
                  key: 'Fee',
                  value: formatCurrency(feeValue, defaultCurrency),
                  isLoading,
                },
              ]}
            />
          </Box>

          {renderError()}

          <Box flex={1} />

          <Button
            isDisabled={isDisabled}
            isLoading={isLoading}
            mt="18px"
            w="100%"
            onPress={onApprove}>
            Submit
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
