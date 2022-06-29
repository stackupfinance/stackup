import React from 'react';
import {Box, Button, HStack, Text, VStack} from 'native-base';
import {BaseSheet} from '.';
import {BaseItem} from '../baseItem';
import {BuyTokenItem} from '../buyTokenItem';

type Props = {
  isOpen: boolean;
  onBack: () => void;
  onClose: () => void;
};

export const BuyTokenSheet = ({isOpen, onBack, onClose}: Props) => {
  return (
    <BaseSheet
      title="Deposit with Ramp"
      isOpen={isOpen}
      onClose={onClose}
      onBack={onBack}>
      <VStack px="30px" space="10px">
        <Box mt="30px">
          <Text fontSize="14px" color="text.3">
            You pay
          </Text>
          <HStack justifyContent="space-between" mt="11px">
            <Box width="50%">
              <BuyTokenItem currency="USDC" />
            </Box>
            <Text fontSize="31px" fontWeight={500}>
              $123
            </Text>
          </HStack>
        </Box>
        <Box my="30px">
          <Text fontSize="14px" color="text.3">
            You receive
          </Text>
          <HStack justifyContent="space-between" mt="11px">
            <Box width="50%">
              <BuyTokenItem currency="USDC" />
            </Box>
            <Text fontSize="31px" fontWeight={500}>
              $124
            </Text>
          </HStack>
        </Box>
        <BaseItem alt="Stackup">
          <HStack justifyContent="space-between">
            <Text color="text.3">Rate</Text>
            <Text>1 USDC ≈ $1.01</Text>
          </HStack>
        </BaseItem>
        <Text
          my="10px"
          fontSize="9px"
          fontFamily="heading"
          textAlign="center"
          color="text.3">
          By continuing you agree to use one of our payment partner and be
          redirected to their platform to finalize your purchase.
        </Text>
        <Button width="100%">Agree &amp; Continue</Button>
      </VStack>
    </BaseSheet>
  );
};
