import React, {
  useCallback,
  useMemo,
  useRef,
  useEffect,
  FunctionComponent,
} from 'react';
import {Dimensions} from 'react-native';
import {Box, HStack, Heading, VStack, Button, Divider} from 'native-base';
import BottomSheet, {BottomSheetHandleProps} from '@gorhom/bottom-sheet';
import {faArrowUpRightFromSquare} from '@fortawesome/free-solid-svg-icons/faArrowUpRightFromSquare';
import {faXmark} from '@fortawesome/free-solid-svg-icons/faXmark';
import {faDiscord} from '@fortawesome/free-brands-svg-icons/faDiscord';
import {px2dp} from '../utils/units';
import {IconButton, MenuItem} from '.';
import {AppColors} from '../config';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onHelpPress: () => void;
  onDiscordPress: () => void;
  onRemoveWalletPress: () => void;
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
        Settings
      </Heading>

      <IconButton icon={faXmark} onPress={onClose} />
    </HStack>
  );
};

export const SettingsSheet = ({
  isOpen,
  onClose,
  onHelpPress,
  onDiscordPress,
  onRemoveWalletPress,
}: Props) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(
    () => [Dimensions.get('window').height - px2dp(49)],
    [],
  );

  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isOpen]);

  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  return (
    <BottomSheet
      backgroundStyle={{
        backgroundColor: AppColors.background[1],
      }}
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      handleComponent={handleComponentFn(onClose)}>
      <VStack flex={1} p="24px" backgroundColor="background.1" space="11px">
        <MenuItem
          heading="Help & Support"
          icon={faArrowUpRightFromSquare}
          onPress={onHelpPress}
        />

        <MenuItem
          heading="Join Stackup community"
          description="We’re not big yet, but we like to make new friends :)"
          backgroundColor={AppColors.palettes.primary[600]}
          icon={faDiscord}
          onPress={onDiscordPress}
        />

        <Divider />

        <Button colorScheme="tertiary" onPress={onRemoveWalletPress}>
          Remove Wallet
        </Button>
      </VStack>
    </BottomSheet>
  );
};
