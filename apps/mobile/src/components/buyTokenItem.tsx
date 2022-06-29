import React, {PropsWithChildren} from 'react';
import {HStack, VStack, Text} from 'native-base';
import {BaseItem} from './baseItem';
import {CurrencySymbols, CurrencyMeta} from '../config';

type Props = {
  currency: CurrencySymbols;
};

export const BuyTokenItem = ({currency}: PropsWithChildren<Props>) => {
  return (
    <BaseItem source={CurrencyMeta[currency].logo} alt="portfolioItem">
      <VStack>
        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize="16px" fontWeight={500}>
            {CurrencyMeta[currency].name}
          </Text>
        </HStack>
      </VStack>
    </BaseItem>
  );
};
