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
  onChange: (currency: CurrencySymbols) => void;
  currencyList: Array<SelectCurrencyItem>;
};

export const SwapSelectTokenSheet = ({
  isOpen,
  onClose,
  onChange,
  currencyList,
}: Props) => {
  return (
    <BaseSheet title="Select currency" isOpen={isOpen} onClose={onClose}>
      <VStack flex={1} p="24px" backgroundColor="background.1" space="11px">
        {currencyList.map(props => (
          <SelectCurrencyItem
            key={`swap-select-token-item-${props.currency}`}
            {...props}
            onPress={() => onChange(props.currency)}
          />
        ))}
      </VStack>
    </BaseSheet>
  );
};
