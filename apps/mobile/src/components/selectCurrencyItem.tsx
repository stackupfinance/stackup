import React from 'react';
import {Pressable, HStack, VStack, Text} from 'native-base';
import hexToRgba from 'hex-to-rgba';
import {BigNumberish} from 'ethers';
import {BaseItem} from '.';
import {AppColors, CurrencySymbols, CurrencyMeta} from '../config';
import {formatCurrency} from '../utils/currency';

type Props = {
  currency: CurrencySymbols;
  balance: BigNumberish;
  onPress: (currency: CurrencySymbols) => void;
};

export const SelectCurrencyItem = ({currency, balance, onPress}: Props) => {
  return (
    <Pressable onPress={() => onPress(currency)}>
      {({isPressed}) => (
        <BaseItem
          alt="selectCurrencyItem"
          source={CurrencyMeta[currency].logo}
          backgroundColor={
            isPressed
              ? hexToRgba(AppColors.background[3], 0.8)
              : AppColors.background[3]
          }>
          <HStack justifyContent="space-between" alignItems="center">
            <VStack justifyContent="space-between">
              <Text fontWeight={600} fontSize="16px" color="white">
                {CurrencyMeta[currency].name}
              </Text>

              <Text fontWeight={300} fontSize="14px" color="text.1">
                {formatCurrency(balance, currency)}
              </Text>
            </VStack>
          </HStack>
        </BaseItem>
      )}
    </Pressable>
  );
};
