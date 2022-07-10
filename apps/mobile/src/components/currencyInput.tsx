import React, {useState, useEffect} from 'react';
import {Input} from 'native-base';
import {BigNumberish} from 'ethers';
import {
  formatCurrency,
  parseCurrency,
  stringToValidFloat,
} from '../utils/currency';
import {CurrencySymbols} from '../config';

type Props = {
  value?: BigNumberish;
  currency: CurrencySymbols;
  onValueChange: (value: BigNumberish) => void;
};

export const CurrencyInput = ({value, currency, onValueChange}: Props) => {
  const [inputValue, setInputValue] = useState(formatCurrency('0', currency));

  useEffect(() => {
    setInputValue(formatCurrency(value ?? '0', currency));
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
      setInputValue(formatCurrency(currencyValue, currency));
    } else {
      onValueChange('0');
      setInputValue(formatCurrency('0', currency));
    }
  };

  return (
    <Input
      pr="0px"
      borderWidth="0px"
      keyboardType="decimal-pad"
      value={inputValue}
      textAlign="right"
      fontSize="24px"
      fontWeight={500}
      color="white"
      onChangeText={onChangeText}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
};
