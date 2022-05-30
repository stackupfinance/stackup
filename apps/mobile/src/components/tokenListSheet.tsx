import React, {useMemo, useRef, useEffect, FunctionComponent} from 'react';
import {Dimensions} from 'react-native';
import {Box, HStack, Heading, VStack} from 'native-base';
import BottomSheet, {BottomSheetHandleProps} from '@gorhom/bottom-sheet';
import {faXmark} from '@fortawesome/free-solid-svg-icons/faXmark';
import {BigNumberish} from 'ethers';
import {px2dp} from '../utils/units';
import {IconButton, ManageTokenItem} from '.';
import {AppColors, CurrencySymbols} from '../config';

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

type HandleComponentFn = (
  onClose: Props['onClose'],
) => FunctionComponent<BottomSheetHandleProps>;

const handleComponentFn: HandleComponentFn = onClose => () => {
  return (
    <HStack
      backgroundColor="background.3"
      borderTopRadius="15px"
      pt="24px"
      pb="15px"
      px="18px"
      justifyContent="space-between"
      alignItems="center">
      <Box />

      <Heading fontSize="16px" fontFamily="heading">
        Manage token list
      </Heading>

      <IconButton icon={faXmark} onPress={onClose} />
    </HStack>
  );
};

export const TokenListSheet = ({
  isOpen,
  tokenSettings,
  onTokenChange,
  onClose,
}: Props) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(
    () => [Dimensions.get('window').height - px2dp(49)],
    [],
  );

  const onValueChange = (currency: CurrencySymbols) => (enabled: boolean) => {
    onTokenChange(currency, enabled);
  };

  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isOpen]);

  return (
    <BottomSheet
      backgroundStyle={{
        backgroundColor: AppColors.background[1],
      }}
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      handleComponent={handleComponentFn(onClose)}>
      <VStack flex={1} p="24px" backgroundColor="background.1" space="11px">
        {tokenSettings.map(props => (
          <ManageTokenItem
            key={`manage-token-item-${props.currency}`}
            {...props}
            onValueChange={onValueChange(props.currency)}
          />
        ))}
      </VStack>
    </BottomSheet>
  );
};
