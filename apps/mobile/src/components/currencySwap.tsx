import React from 'react';
import {Box, HStack, Text, Center} from 'native-base';
import {BigNumberish} from 'ethers';
import {faArrowsUpDown} from '@fortawesome/free-solid-svg-icons/faArrowsUpDown';
import {CurrencyInput, DropdownButton, IconButton} from '.';
import {CurrencySymbols, CurrencyBalances} from '../config';
import {formatCurrency} from '../utils/currency';

type Props = {
  baseCurrency: CurrencySymbols;
  quoteCurrency: CurrencySymbols;
  baseCurrencyValue: BigNumberish;
  quoteCurrencyValue: BigNumberish;
  currencyBalances: CurrencyBalances;
  onBaseCurrencyPress: () => void;
  onQuoteCurrencyPress: () => void;
  onBaseCurrencyValueChange: (value: BigNumberish) => void;
  onQuoteCurrencyValueChange: (value: BigNumberish) => void;
  onSwapPress: () => void;
};

export const CurrencySwap = ({
  baseCurrency,
  quoteCurrency,
  baseCurrencyValue,
  quoteCurrencyValue,
  currencyBalances,
  onBaseCurrencyPress,
  onQuoteCurrencyPress,
  onBaseCurrencyValueChange,
  onQuoteCurrencyValueChange,
  onSwapPress,
}: Props) => {
  return (
    <Box px="12px">
      <HStack mb="12px" justifyContent="space-between" alignItems="center">
        <Text fontWeight={500} color="text.2">
          You pay
        </Text>

        <Text fontWeight={500} color="text.2">
          Balance:{' '}
          <Text fontWeight={500} color="white">
            {formatCurrency(
              currencyBalances[baseCurrency] ?? '0',
              baseCurrency,
            )}
          </Text>
        </Text>
      </HStack>

      <HStack mb="12px" justifyContent="center" alignItems="center">
        <Box flex={1}>
          <DropdownButton
            currency={baseCurrency}
            onPress={onBaseCurrencyPress}
          />
        </Box>

        <Box flex={1}>
          <CurrencyInput
            value={baseCurrencyValue}
            currency={baseCurrency}
            onValueChange={onBaseCurrencyValueChange}
          />
        </Box>
      </HStack>

      <Box mb="12px" justifyContent="center" alignItems="center">
        <Center rounded="full" backgroundColor="background.3" w="40px" h="40px">
          <IconButton icon={faArrowsUpDown} onPress={onSwapPress} />
        </Center>
      </Box>

      <HStack justifyContent="center" alignItems="center">
        <Box flex={1}>
          <DropdownButton
            currency={quoteCurrency}
            onPress={onQuoteCurrencyPress}
          />
        </Box>

        <Box flex={1}>
          <CurrencyInput
            value={quoteCurrencyValue}
            currency={quoteCurrency}
            onValueChange={onQuoteCurrencyValueChange}
          />
        </Box>
      </HStack>
    </Box>
  );
};
