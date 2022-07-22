import React from 'react';
import {ImageSourcePropType} from 'react-native';
import {HStack, VStack, Text} from 'native-base';
import {BaseItem, Switch} from '.';
import {AppColors} from '../config';

type Props = {
  isLoading: boolean;
  heading: string;
  description: string;
  isActive: boolean;
  onValueChange: (value: boolean) => void;
  source: ImageSourcePropType;
};

export const SecuritySwitch = ({
  isLoading,
  heading,
  description,
  isActive,
  onValueChange,
  source,
}: Props) => {
  return (
    <BaseItem
      alt="menuItem"
      source={source}
      backgroundColor={AppColors.background[3]}>
      <HStack justifyContent="space-between" alignItems="center">
        <VStack justifyContent="space-between">
          <Text fontWeight={500} fontSize="16px" color="white">
            {heading}
          </Text>

          <Text fontWeight={300} fontSize="14px" color="text.3">
            {description}
          </Text>
        </VStack>

        <Switch
          isLoading={isLoading}
          enabled={isActive}
          onValueChange={onValueChange}
        />
      </HStack>
    </BaseItem>
  );
};
