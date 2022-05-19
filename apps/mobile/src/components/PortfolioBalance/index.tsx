import React  from 'react';
import {
  Box,
  Button,
  Text,
  HStack,
  Heading,
} from "native-base";

interface PortfolioBalanceProps {
  balance: number;
  valueChange: number;
  changePercent: number;
  isHidden: boolean;
  toggleVisibility: () => void;
}

const PortfolioBalance = (props: PortfolioBalanceProps) => {
  const { balance, isHidden, changePercent, valueChange, toggleVisibility } = props;
  const changeValueIndicator = (valueChange > 0) ? '+' : '-';
  const toggleBalanceText = isHidden ? 'Show balance' : 'Hide';

  return (
    <Box alignItems="center">
      {
        !isHidden && <Box alignItems="center">
          <Heading size="3xl" fontWeight={600}>${balance}</Heading>
          <HStack space={3}>
            <Text fontSize="xl">{changeValueIndicator}${valueChange}</Text>
            <Text fontSize="xl" color="#1ED759">{changePercent}%</Text>
          </HStack>
        </Box>
      }
      <Box alignItems="center">
      <Button variant="link" onPress={() => toggleVisibility()}>{toggleBalanceText}</Button>
      </Box>
    </Box>
  );
};

export default PortfolioBalance;