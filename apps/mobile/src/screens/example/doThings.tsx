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
  return (
    <Box bg={useColorModeValue("warmGray.50", "coolGray.800")}>
      <Text>Stackup Wallet</Text>
      <PortfolioBalance />
      <TokenList />
      <Button onPress={toggleColorMode}>
        <Text>Toggle color mode</Text>
      </Button>
      <Footer />
    </Box>
  );
}
