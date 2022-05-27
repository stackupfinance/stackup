import React from 'react';
import {Box, Button, Text, HStack, Heading, useTheme} from 'native-base';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faArrowTrendUp} from '@fortawesome/free-solid-svg-icons/faArrowTrendUp';
import {faArrowTrendDown} from '@fortawesome/free-solid-svg-icons/faArrowTrendDown';

interface PortfolioBalanceProps {
  balance: number;
  valueChange: number;
  changePercent: number;
  isHidden: boolean;
  toggleVisibility: () => void;
}

const PortfolioBalance = (props: PortfolioBalanceProps) => {
  const {balance, isHidden, changePercent, valueChange, toggleVisibility} =
    props;
  const changeValueIndicator = valueChange >= 0 ? '+' : '-';
  const toggleBalanceText = isHidden ? 'Show balance' : 'Hide';
  const {colors} = useTheme();
  /* @ts-ignore */
  const gainColor = colors.text[6];
  const lossColor = colors.tertiary[600];
  const changePercentColor = changePercent > 0 ? gainColor : lossColor;
  const trendIcon =
    valueChange > 0 ? (
      <FontAwesomeIcon
        icon={faArrowTrendUp}
        style={{color: gainColor}}
        size={20}
      />
    ) : (
      <FontAwesomeIcon
        icon={faArrowTrendDown}
        style={{color: lossColor}}
        size={20}
      />
    );
  return (
    <Box alignItems="center" my="4">
      {!isHidden && (
        <Box alignItems="center">
          <Heading size="3xl" fontWeight={600}>
            ${balance}
          </Heading>
          <HStack space={3}>
            <Text fontSize="xl">
              {changeValueIndicator}${valueChange.toString().replace(/^-/, '')}
            </Text>
            <Text fontSize="xl" color={changePercentColor}>
              {changePercent}%
            </Text>
            <Box mt="1">{trendIcon}</Box>
          </HStack>
        </Box>
      )}
      <Box alignItems="center">
        <Button variant="link" onPress={() => toggleVisibility()}>
          {toggleBalanceText}
        </Button>
      </Box>
    </Box>
  );
};

export default PortfolioBalance;
