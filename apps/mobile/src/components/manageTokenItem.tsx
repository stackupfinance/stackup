import React from 'react';
import {HStack, VStack, Text} from 'native-base';
import {BigNumberish} from 'ethers';
import {BaseItem, Switch} from '.';
import {AppColors, CurrencySymbols, CurrencyMeta} from '../config';
import {formatCurrency} from '../utils/currency';

type Props = {
  currency: CurrencySymbols;
  balance: BigNumberish;
  enabled: boolean;
  onValueChange: (value: boolean) => void;
};

export const ManageTokenItem = ({
  currency,
  balance,
  enabled,
  onValueChange,
}: Props) => {
  return (
    <BaseItem
      alt="manageTokenItem"
      source={CurrencyMeta[currency].logo}
      backgroundColor={AppColors.background[3]}>
      <HStack justifyContent="space-between" alignItems="center">
        <VStack justifyContent="space-between">
          <Text fontWeight={600} fontSize="16px" color="white">
            {CurrencyMeta[currency].name}
          </Text>

          <Text fontWeight={300} fontSize="14px" color="text.1">
            {formatCurrency(balance, currency)}
          </Text>
        </VStack>

        <Switch enabled={enabled} onValueChange={onValueChange} />
      </HStack>
    </BaseItem>
  );
};
