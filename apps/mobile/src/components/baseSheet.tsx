import React, {
  useMemo,
  useRef,
  useEffect,
  FunctionComponent,
  PropsWithChildren,
} from 'react';
import {Dimensions} from 'react-native';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import BottomSheet, {BottomSheetHandleProps} from '@gorhom/bottom-sheet';
import {px2dp} from '../utils/units';
import {SheetHandle} from '.';
import {AppColors} from '../config';

type Props = {
  title: string;
  isOpen: boolean;
  onBack?: () => void;
  onClose: () => void;
};

type HandleComponentFn = (
  title: Props['title'],
  onClose: Props['onClose'],
  onBack?: Props['onBack'],
) => FunctionComponent<BottomSheetHandleProps>;

const handleComponentFn: HandleComponentFn = (title, onClose, onBack) => () => {
  return <SheetHandle title={title} onClose={onClose} onBack={onBack} />;
};

export const BaseSheet = ({
  title,
  isOpen,
  onBack,
  onClose,
  children,
}: PropsWithChildren<Props>) => {
  const statusBarHeight = getStatusBarHeight(true);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(
    () => [Dimensions.get('window').height - px2dp(49) - statusBarHeight],
    [statusBarHeight],
  );

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
      handleComponent={handleComponentFn(title, onClose, onBack)}>
      {children}
    </BottomSheet>
  );
};
