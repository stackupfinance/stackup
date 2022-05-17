import React, {useState} from 'react';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ExampleStackParamList} from '../../config';
import PortfolioBalance from '../../components/PortfolioBalance';
import TokenList from '../../components/TokenList';
import Footer from '../../components/Footer';

type Props = NativeStackScreenProps<ExampleStackParamList, 'DoThings'>;
import { Box, Button, Text, useColorMode, useColorModeValue } from "native-base";

export default function DoThingsScreen({}: Props) {
  const {
    toggleColorMode
  } = useColorMode();

  const [balanceIsHidden, setBalanceIsHidden] = useState(false);
  const toggleVisibilityHandler = () => setBalanceIsHidden(!balanceIsHidden);

  return (
    <Box bg={useColorModeValue("warmGray.50", "background.1")}>
      <Text>Stackup Wallet</Text>
      <PortfolioBalance 
        balance={96147.47} 
        changeValue={21170}
        changePercent={22}
        isHidden={balanceIsHidden}
        toggleVisibility={toggleVisibilityHandler}
      />
      <TokenList />
      <Button onPress={toggleColorMode}>
        <Text>Toggle color mode</Text>
      </Button>
      <Footer />
    </Box>
  );
}
