import React from 'react';
import {HStack, Pressable, Text, Image} from 'native-base';
import hexToRgba from 'hex-to-rgba';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faChevronDown} from '@fortawesome/free-solid-svg-icons/faChevronDown';
import {CurrencySymbols, CurrencyMeta, AppColors} from '../config';

type Props = {
  isDisabled?: boolean;
  currency: CurrencySymbols;
  onPress: () => void;
};

export const DropdownButton = ({isDisabled, currency, onPress}: Props) => {
  return (
    <Pressable isDisabled={isDisabled} onPress={onPress} hitSlop={16} w="140px">
      {({isPressed}) => (
        <HStack
          w="100%"
          p="12px"
          backgroundColor={
            isPressed
              ? hexToRgba(AppColors.background[3], 0.8)
              : AppColors.background[3]
          }
          borderRadius="16px"
          justifyContent="space-between"
          alignItems="center">
          <Image
            key={`dropdown-button-${currency}`}
            source={CurrencyMeta[currency].logo}
            alt="dropdown-button-logo"
            w="32px"
            h="32px"
          />

          <Text
            fontWeight={600}
            fontSize="16px"
            color={isDisabled ? AppColors.text[3] : 'white'}>
            {CurrencyMeta[currency].displaySymbol}
          </Text>

          <FontAwesomeIcon
            icon={faChevronDown}
            color={isDisabled ? AppColors.text[3] : 'white'}
            size={12}
          />
        </HStack>
      )}
    </Pressable>
  );
};
