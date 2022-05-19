import React, {useState} from 'react';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ExampleStackParamList} from '../../config';
import PortfolioBalance from '../../components/PortfolioBalance';
import List from '../../components/List';
import Footer from '../../components/Footer';
import SearchBar from '../../components/SearchBar';

type Props = NativeStackScreenProps<ExampleStackParamList, 'DoThings'>;
import { Box, Button, Text, useColorMode, useColorModeValue } from "native-base";

export default function DoThingsScreen({}: Props) {
  const {
    toggleColorMode
  } = useColorMode();

  // PortfolioBalance props
  const [balanceIsHidden, setBalanceIsHidden] = useState(false);
  const toggleVisibilityHandler = () => setBalanceIsHidden(!balanceIsHidden);

  // List props
  const tokenData = [
    { 
      name: 'Bitcoin',
      id: '1',
      value: '1.332 BTC',
      valueUSDC: '$52,472',
      percentChange: '19',
      valueChange: '9230',
    },
    { 
      name: 'Ethereum',
      id: '2',
      value: '8.123 ETH',
      valueUSDC: '$20,504',
      percentChange: '10',
      valueChange: '2050',
    },
    { 
      name: 'USDC',
      id: '3',
      value: '24,300 USDC',
      valueUSDC: '$24,180',
      percentChange: '40',
      valueChange: '10000',
    },
  ];

  return (
    <Box bg={useColorModeValue("warmGray.50", "background.1")}>
      <SearchBar />
      <PortfolioBalance 
        balance={96147.47} 
        valueChange={21170}
        changePercent={22}
        isHidden={balanceIsHidden}
        toggleVisibility={toggleVisibilityHandler}
      />
      <List data={tokenData} title="Token List" />
      <Button onPress={toggleColorMode} my="5" py="5">
        <Text>Toggle color mode</Text>
      </Button>
      <Footer />
    </Box>
  );
}
