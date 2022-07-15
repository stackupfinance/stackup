import React from 'react';
import {Box, VStack, Text, Divider} from 'native-base';
import {CurrencySymbols} from '../config';
import {BigNumberish} from 'ethers';
import {formatCurrency} from '../utils/currency';

type Props = {
  baseCurrency: CurrencySymbols;
  quoteCurrency: CurrencySymbols;
  baseCurrencyValue: BigNumberish;
  quoteCurrencyValue: BigNumberish;
};

export const SwapSummary = ({
  baseCurrency,
  quoteCurrency,
  baseCurrencyValue,
  quoteCurrencyValue,
}: Props) => {
  return (
    <Box w="100%" backgroundColor="background.3" borderRadius="8px">
      <VStack py="12px" px="22px">
        <Text fontWeight={500} color="text.2">
          You pay
        </Text>
        <Text fontWeight={500} fontSize="28px">
          {formatCurrency(baseCurrencyValue, baseCurrency)}
        </Text>
      </VStack>
      <Divider />
      <VStack py="12px" px="22px">
        <Text fontWeight={500} color="text.2">
          You receive
        </Text>
        <Text fontWeight={500} fontSize="31px">
          {formatCurrency(quoteCurrencyValue, quoteCurrency)}
        </Text>
      </VStack>
    </Box>
  );
};
