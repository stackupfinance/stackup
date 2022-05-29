import React, {PropsWithChildren} from 'react';
import {Box, Button, Text, HStack, Heading} from 'native-base';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faArrowTrendUp} from '@fortawesome/free-solid-svg-icons/faArrowTrendUp';
import {faArrowTrendDown} from '@fortawesome/free-solid-svg-icons/faArrowTrendDown';
import {ethers, BigNumberish} from 'ethers';
import {AppColors, CurrencySymbols} from '../config';
import {formatCurrency, valueChange, percentChange} from '../utils/currency';

interface Props {
  previousBalance: BigNumberish;
  currentBalance: BigNumberish;
  currency: CurrencySymbols;
  isHidden: boolean;
  onToggleVisibility: () => void;
}

export const PortfolioBalance = ({
  previousBalance,
  currentBalance,
  currency,
  isHidden,
  onToggleVisibility,
}: PropsWithChildren<Props>) => {
  const visibilityButtonText = isHidden ? 'Show' : 'Hide';
  const isTrendUp = ethers.BigNumber.from(currentBalance).gte(previousBalance);
  const changeValueIndicator = isTrendUp ? '+' : '-';
  const changePercentColor = isTrendUp
    ? AppColors.singletons.good
    : AppColors.singletons.warning;
  const trendIcon = isTrendUp ? (
    <FontAwesomeIcon
      icon={faArrowTrendUp}
      style={{color: AppColors.singletons.good}}
      size={20}
    />
  ) : (
    <FontAwesomeIcon
      icon={faArrowTrendDown}
      style={{color: AppColors.singletons.warning}}
      size={20}
    />
  );

  return (
    <Box w="100%" justifyContent="center" alignItems="center">
      <Heading fontWeight={600} fontSize="46px">
        {isHidden ? '••••••••••' : formatCurrency(currentBalance, currency)}
      </Heading>

      <HStack space="10px">
        <Text fontWeight={600} fontSize="18px" color="text.2">
          {isHidden
            ? '••••••••'
            : `${changeValueIndicator} ${formatCurrency(
                valueChange(previousBalance, currentBalance),
                currency,
              )}`}
        </Text>

        <Text fontWeight={600} fontSize="18px" color={changePercentColor}>
          {`${
            isHidden
              ? '•••'
              : `${percentChange(previousBalance, currentBalance, currency)}%`
          }`}{' '}
          {trendIcon}
        </Text>
      </HStack>

      <Button variant="link" onPress={onToggleVisibility}>
        {visibilityButtonText}
      </Button>
    </Box>
  );
};
