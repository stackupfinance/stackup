import React from 'react';
import {Box, HStack, Text, Center} from 'native-base';
import {faArrowsUpDown} from '@fortawesome/free-solid-svg-icons/faArrowsUpDown';
import {CurrencyInput, DropdownButton, IconButton} from '.';
import {CurrencySymbols} from '../config';

type Props = {
  baseCurrency: CurrencySymbols;
  quoteCurrency: CurrencySymbols;
  onBaseCurrencyPress: () => void;
  onQuoteCurrencyPress: () => void;
};

export const CurrencySwap = ({
  baseCurrency,
  quoteCurrency,
  onBaseCurrencyPress,
  onQuoteCurrencyPress,
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
            $100.00
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
          <CurrencyInput currency={baseCurrency} />
        </Box>
      </HStack>

      <Box mb="12px" justifyContent="center" alignItems="center">
        <Center rounded="full" backgroundColor="background.3" w="40px" h="40px">
          <IconButton icon={faArrowsUpDown} onPress={() => {}} />
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
          <CurrencyInput currency={quoteCurrency} />
        </Box>
      </HStack>
    </Box>
  );
};
