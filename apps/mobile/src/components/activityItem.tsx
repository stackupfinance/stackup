import React from 'react';
import {HStack, VStack, Text} from 'native-base';
import {faArrowUp} from '@fortawesome/free-solid-svg-icons/faArrowUp';
import {faArrowDown} from '@fortawesome/free-solid-svg-icons/faArrowDown';
import {IconDefinition} from '@fortawesome/fontawesome-common-types';
import {BigNumberish} from 'ethers';
import {BaseItem} from '.';
import {
  CurrencySymbols,
  CurrencyMeta,
  ActivityType,
  AppColors,
} from '../config';
import {formatCurrency} from '../utils/currency';
import {truncate} from '../utils/address';

type Props = {
  currency: CurrencySymbols;
  type: ActivityType;
  value: BigNumberish;
  from: string;
  to: string;
};

export const ActivityItem = ({currency, type, value, from, to}: Props) => {
  let sourceIcon: IconDefinition | undefined;
  let heading = '';
  let currencyValue = formatCurrency(value, currency);
  let currencyColor = 'white';
  let description = '';
  switch (type) {
    case 'INCOMING_CURRENCY':
      sourceIcon = faArrowDown;
      heading = 'Received';
      currencyValue = `+${currencyValue}`;
      currencyColor = AppColors.singletons.good;
      description = `${truncate(from)}`;
      break;
    case 'OUTGOING_CURRENCY':
      sourceIcon = faArrowUp;
      heading = 'Sent';
      currencyValue = `-${currencyValue}`;
      description = `${truncate(to)}`;
      break;
    default:
      break;
  }

  return (
    <BaseItem
      alt="activity-item"
      source={CurrencyMeta[currency].logo}
      sourceIcon={sourceIcon}>
      <VStack>
        <HStack justifyContent="space-between">
          <Text fontWeight={500} fontSize="16px">
            {heading}
          </Text>

          <Text fontWeight={600} fontSize="16px" color={currencyColor}>
            {currencyValue}
          </Text>
        </HStack>

        <Text color="text.3">{description}</Text>
      </VStack>
    </BaseItem>
  );
};
