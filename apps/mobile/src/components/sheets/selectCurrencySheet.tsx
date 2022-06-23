import React from 'react';
import {VStack} from 'native-base';
import {BigNumberish} from 'ethers';
import {BaseSheet} from '.';
import {SelectCurrencyItem} from '..';
import {CurrencySymbols} from '../../config';

type SelectCurrencyItem = {
  currency: CurrencySymbols;
  balance: BigNumberish;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  currencyList: Array<SelectCurrencyItem>;
  onSelectCurrencyItem: (currency: CurrencySymbols) => void;
};

export const SelectCurrencySheet = ({
  isOpen,
  onClose,
  currencyList,
  onSelectCurrencyItem,
}: Props) => {
  return (
    <BaseSheet title="Select currency" isOpen={isOpen} onClose={onClose}>
      <VStack flex={1} p="24px" backgroundColor="background.1" space="11px">
        {currencyList.map(props => (
          <SelectCurrencyItem
            key={`select-currency-item-${props.currency}`}
            {...props}
            onPress={onSelectCurrencyItem}
          />
        ))}
      </VStack>
    </BaseSheet>
  );
};
