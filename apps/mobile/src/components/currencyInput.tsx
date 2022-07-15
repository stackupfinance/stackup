import React, {useState, useEffect} from 'react';
import {Input} from 'native-base';
import {BigNumberish} from 'ethers';
import {
  formatCurrencyNoSymbol,
  parseCurrency,
  stringToValidFloat,
} from '../utils/currency';
import {CurrencySymbols} from '../config';

type Props = {
  isDisabled?: boolean;
  isEditable?: boolean;
  value?: BigNumberish;
  currency: CurrencySymbols;
  onValueChange?: (value: BigNumberish) => void;
};

export const CurrencyInput = ({
  isDisabled,
  isEditable = true,
  value,
  currency,
  onValueChange = () => {},
}: Props) => {
  const [inputValue, setInputValue] = useState(
    formatCurrencyNoSymbol('0', currency),
  );

  useEffect(() => {
    setInputValue(formatCurrencyNoSymbol(value ?? '0', currency));
  }, [value, currency]);

  const onChangeText = (text: string) => {
    setInputValue(text);
  };

  const onFocus = () => {
    setInputValue(stringToValidFloat(inputValue));
  };

  const onBlur = () => {
    if (inputValue) {
      const currencyValue = parseCurrency(
        stringToValidFloat(inputValue),
        currency,
      );
      onValueChange(currencyValue);
      setInputValue(formatCurrencyNoSymbol(currencyValue, currency));
    } else {
      onValueChange('0');
      setInputValue(formatCurrencyNoSymbol('0', currency));
    }
  };

  return (
    <Input
      p="12px"
      isDisabled={isDisabled}
      editable={isEditable}
      borderWidth={isEditable ? undefined : '0px'}
      borderRadius="16px"
      keyboardType="decimal-pad"
      value={inputValue}
      textAlign="right"
      fontSize="18px"
      fontWeight={500}
      color="white"
      onChangeText={onChangeText}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
};
