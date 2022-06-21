import React from 'react';
import {HStack, Text} from 'native-base';
import {BaseItem, FingerprintLogo, Switch} from '.';
import {AppColors} from '../config';

type Props = {
  enabled: boolean;
  onValueChange: (value: boolean) => void;
};

export const EnableFingerprint = ({enabled, onValueChange}: Props) => {
  return (
    <BaseItem
      alt="menuItem"
      source={FingerprintLogo}
      backgroundColor={AppColors.background[3]}>
      <HStack justifyContent="space-between" alignItems="center">
        <Text fontWeight={500} fontSize="16px" color="white">
          Enable fingerprint
        </Text>

        <Switch onValueChange={onValueChange} enabled={enabled} />
      </HStack>
    </BaseItem>
  );
};
