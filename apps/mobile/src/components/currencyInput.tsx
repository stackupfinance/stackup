import React, {useState, useEffect} from 'react';
import {Input} from 'native-base';
import {
  formatCurrency,
  parseCurrency,
  stringToValidFloat,
} from '../utils/currency';
import {CurrencySymbols} from '../config';

type Props = {
  currency: CurrencySymbols;
};

export const CurrencyInput = ({currency}: Props) => {
  const [value, setValue] = useState(formatCurrency('0', currency));

  useEffect(() => {
    setValue(formatCurrency('0', currency));
  }, [currency]);

  const onChangeText = (text: string) => {
    setValue(text);
  };

  const onFocus = () => {
    setValue(stringToValidFloat(value));
  };

  const onBlur = () => {
    value
      ? setValue(
          formatCurrency(
            parseCurrency(stringToValidFloat(value), currency),
            currency,
          ),
        )
      : setValue(formatCurrency('0', currency));
  };

  return (
    <Input
      pr="0px"
      borderWidth="0px"
      keyboardType="decimal-pad"
      value={value}
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
