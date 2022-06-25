import React, {useState} from 'react';
import {Input, Box, VStack, Text, Button, useToast} from 'native-base';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faCheck} from '@fortawesome/free-solid-svg-icons/faCheck';
import {BigNumberish, ethers} from 'ethers';
import {BaseSheet} from '.';
import {
  CurrencySymbols,
  CurrencyBalances,
  CurrencyMeta,
  AppColors,
} from '../../config';
import {formatCurrency, parseCurrency} from '../../utils/currency';
import {isValid} from '../../utils/address';

type Props = {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onBack: () => void;
  onNext: (toAddress: string, value: BigNumberish) => Promise<void>;
  currency: CurrencySymbols;
  currencyBalances: CurrencyBalances;
};

const TO_FLOAT_REGEX = /[^\d.-]/g;

export const SendSheet = ({
  isOpen,
  isLoading,
  onClose,
  onBack,
  onNext,
  currency,
  currencyBalances,
}: Props) => {
  const toast = useToast();
  const [address, setAddress] = useState('');
  const [value, setValue] = useState(formatCurrency('0', currency));

  const onNav = (cb: () => void) => () => {
    setAddress('');
    setValue(formatCurrency('0', currency));
    cb();
  };

  const onChangeText = (text: string) => {
    setValue(text);
  };

  const onFocus = () => {
    setValue(parseFloat(value.replace(TO_FLOAT_REGEX, '')).toString());
  };

  const onBlur = () => {
    value
      ? setValue(formatCurrency(parseCurrency(value, currency), currency))
      : setValue(formatCurrency('0', currency));
  };

  const onNextHandler = async () => {
    const toAddress = address;
    const parsedValue = parseCurrency(
      parseFloat(value.replace(TO_FLOAT_REGEX, '')).toString(),
      currency,
    );

    if (!isValid(address)) {
      toast.show({
        title: 'Not a valid address',
        backgroundColor: AppColors.singletons.warning,
        placement: 'top',
      });

      return;
    } else if (ethers.BigNumber.from(parsedValue).isZero()) {
      toast.show({
        title: 'Value must be greater than 0',
        backgroundColor: AppColors.singletons.warning,
        placement: 'top',
      });

      return;
    }

    await onNext(toAddress, parsedValue);
    setAddress('');
    setValue(formatCurrency('0', currency));
  };

  return (
    <BaseSheet
      title={`Send ${CurrencyMeta[currency].name}`}
      isOpen={isOpen}
      onClose={onNav(onClose)}
      onBack={onNav(onBack)}>
      <Input
        borderTopWidth="0px"
        borderRightWidth="0px"
        borderLeftWidth="0px"
        height="59px"
        value={address}
        placeholder="0x..."
        onChangeText={setAddress}
        leftElement={
          <Box ml="13px">
            <Text fontSize="16px" fontWeight={500} color="text.5">
              To:
            </Text>
          </Box>
        }
        rightElement={
          <Box mr="13px">
            <FontAwesomeIcon
              icon={faCheck}
              color={
                isValid(address) ? AppColors.singletons.good : AppColors.text[5]
              }
              size={18}
            />
          </Box>
        }
      />

      <VStack p="31px" justifyContent="center" alignItems="center">
        <Input
          borderWidth="0px"
          keyboardType="decimal-pad"
          value={value}
          textAlign="center"
          fontSize="39px"
          fontWeight={600}
          color="white"
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
        />

        <Text fontWeight={600} fontSize="18px" color="text.2">
          Balance:{' '}
          <Text fontWeight={400} color="white">
            {formatCurrency(currencyBalances[currency] ?? '0', currency)}
          </Text>
        </Text>
      </VStack>

      <Box flex={1} />

      <Box px="18px" pb="24px">
        <Button isLoading={isLoading} onPress={onNextHandler}>
          Next
        </Button>
      </Box>
    </BaseSheet>
  );
};
