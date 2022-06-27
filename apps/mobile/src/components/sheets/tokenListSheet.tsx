import React from 'react';
import {VStack} from 'native-base';
import {BigNumberish} from 'ethers';
import {BaseSheet} from '.';
import {ManageTokenItem} from '..';
import {CurrencySymbols} from '../../config';
import {logEvent} from '../../utils/analytics';

type TokenSettings = {
  currency: CurrencySymbols;
  balance: BigNumberish;
  enabled: boolean;
};

type Props = {
  isOpen: boolean;
  tokenSettings: Array<TokenSettings>;
  onTokenChange: (currency: CurrencySymbols, enabled: boolean) => void;
  onClose: () => void;
};

export const TokenListSheet = ({
  isOpen,
  tokenSettings,
  onTokenChange,
  onClose,
}: Props) => {
  const onValueChange = (currency: CurrencySymbols) => (enabled: boolean) => {
    logEvent('CHANGE_CURRENCY_SETTING', {token: currency, enabled: enabled});
    onTokenChange(currency, enabled);
  };

  return (
    <BaseSheet title="Manage currency list" isOpen={isOpen} onClose={onClose}>
      <VStack flex={1} p="24px" backgroundColor="background.1" space="11px">
        {tokenSettings.map(props => (
          <ManageTokenItem
            key={`manage-token-item-${props.currency}`}
            {...props}
            onValueChange={onValueChange(props.currency)}
          />
        ))}
      </VStack>
    </BaseSheet>
  );
};
