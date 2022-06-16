import React, {PropsWithChildren} from 'react';
import {HStack, VStack, Text} from 'native-base';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faArrowTrendUp} from '@fortawesome/free-solid-svg-icons/faArrowTrendUp';
import {faArrowTrendDown} from '@fortawesome/free-solid-svg-icons/faArrowTrendDown';
import {ethers, BigNumberish} from 'ethers';
import {BaseItem} from './baseItem';
import {AppColors, CurrencySymbols, CurrencyMeta} from '../config';
import {formatCurrency, percentChange} from '../utils/currency';

type Props = {
  currency: CurrencySymbols;
  quoteCurrency: CurrencySymbols;
  balance: BigNumberish;
  previousBalanceInQuoteCurrency: BigNumberish;
  currentBalanceInQuoteCurrency: BigNumberish;
  isHidden: boolean;
};

export const PortfolioItem = ({
  currency,
  quoteCurrency,
  balance,
  previousBalanceInQuoteCurrency,
  currentBalanceInQuoteCurrency,
  isHidden,
}: PropsWithChildren<Props>) => {
  const isTrendUp = ethers.BigNumber.from(currentBalanceInQuoteCurrency).gte(
    previousBalanceInQuoteCurrency,
  );
  const changePercentColor = isTrendUp
    ? AppColors.singletons.good
    : AppColors.singletons.warning;
  const trendIcon = isTrendUp ? (
    <FontAwesomeIcon
      icon={faArrowTrendUp}
      style={{color: AppColors.singletons.good}}
      size={15}
    />
  ) : (
    <FontAwesomeIcon
      icon={faArrowTrendDown}
      style={{color: AppColors.singletons.warning}}
      size={15}
    />
  );

  return (
    <BaseItem source={CurrencyMeta[currency].logo} alt="portfolioItem">
      <VStack>
        <HStack justifyContent="space-between" alignItems="center">
          <Text fontSize="16px" fontWeight={500}>
            {CurrencyMeta[currency].name}
          </Text>
          <Text fontSize="16px" fontWeight={500}>
            {isHidden
              ? '•••••••'
              : formatCurrency(currentBalanceInQuoteCurrency, quoteCurrency)}
          </Text>
        </HStack>

        <HStack justifyContent="space-between" alignItems="center">
          <Text color="text.3" fontSize="14px">
            {isHidden ? '•••••••••••••' : formatCurrency(balance, currency)}
          </Text>

          <HStack space="8px">
            <Text color={changePercentColor} fontSize="14px">
              {`${
                isHidden
                  ? '•••'
                  : `${percentChange(
                      previousBalanceInQuoteCurrency,
                      currentBalanceInQuoteCurrency,
                      quoteCurrency,
                    )}%`
              }`}{' '}
              {trendIcon}
            </Text>
          </HStack>
        </HStack>
      </VStack>
    </BaseItem>
  );
};
