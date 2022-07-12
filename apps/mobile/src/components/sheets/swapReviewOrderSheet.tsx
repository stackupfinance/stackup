import React from 'react';
import {Box, Button, Text} from 'native-base';
import {ethers, BigNumberish} from 'ethers';
import {BaseSheet} from '.';
import {SwapSummary, SummaryTable} from '..';
import {
  CurrencySymbols,
  CurrencyBalances,
  OptimalQuote,
  PaymasterStatus,
  CurrencyMeta,
  AppColors,
} from '../../config';
import {formatRate, formatCurrency} from '../../utils/currency';

type Props = {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  defaultCurrency: CurrencySymbols;
  baseCurrency: CurrencySymbols;
  quoteCurrency: CurrencySymbols;
  baseCurrencyValue: BigNumberish;
  quoteCurrencyValue: BigNumberish;
  quote: OptimalQuote | null;
  status: PaymasterStatus | null;
  currencyBalances: CurrencyBalances;
  onSwap: () => Promise<void>;
};

export const SwapReviewOrderSheet = ({
  isOpen,
  isLoading,
  onClose,
  defaultCurrency,
  baseCurrency,
  quoteCurrency,
  baseCurrencyValue,
  quoteCurrencyValue,
  quote,
  status,
  currencyBalances,
  onSwap,
}: Props) => {
  const feeValue = status?.fees[defaultCurrency] ?? '0';
  const defaultCurrencyBalance = currencyBalances[defaultCurrency] ?? '0';
  const baseCurrencyBalance = currencyBalances[baseCurrency] ?? '0';
  const hasInsufficientFunds =
    baseCurrency === defaultCurrency
      ? ethers.BigNumber.from(defaultCurrencyBalance).lt(
          ethers.BigNumber.from(baseCurrencyValue).add(feeValue),
        )
      : ethers.BigNumber.from(baseCurrencyBalance).lt(baseCurrencyValue);
  const hasInsufficientFee =
    baseCurrency === defaultCurrency
      ? hasInsufficientFunds
      : ethers.BigNumber.from(defaultCurrencyBalance).lt(feeValue);
  const isDisabled = hasInsufficientFunds || hasInsufficientFee;

  const renderError = () => {
    let message;
    if (hasInsufficientFunds) {
      message = `Not enough ${CurrencyMeta[baseCurrency].name} for this transaction`;
    } else if (hasInsufficientFee) {
      message = `Not enough ${CurrencyMeta[defaultCurrency].name} to pay fees`;
    }

    return message ? (
      <Text mt="8px" fontWeight={600} color={AppColors.singletons.warning}>
        {message}
      </Text>
    ) : undefined;
  };

  return (
    <BaseSheet title="Review order" isOpen={isOpen} onClose={onClose}>
      <Box height="100%" pt="36px" pb="47px" px="18px" alignItems="center">
        <SwapSummary
          baseCurrency={baseCurrency}
          quoteCurrency={quoteCurrency}
          baseCurrencyValue={baseCurrencyValue}
          quoteCurrencyValue={quoteCurrencyValue}
        />

        <Box w="100%" mt="14px">
          <SummaryTable
            rows={[
              {
                key: 'Rate',
                value: formatRate(
                  baseCurrency,
                  quoteCurrency,
                  quote?.rate || '0',
                ),
              },
              {
                key: 'Fee',
                value: status
                  ? formatCurrency(
                      status.fees[defaultCurrency] ?? '0',
                      defaultCurrency,
                    )
                  : '',
              },
            ]}
          />
        </Box>

        {renderError()}

        <Box flex={1} />

        <Button
          w="100%"
          isDisabled={isDisabled}
          isLoading={isLoading}
          onPress={onSwap}>
          Swap
        </Button>
      </Box>
    </BaseSheet>
  );
};
