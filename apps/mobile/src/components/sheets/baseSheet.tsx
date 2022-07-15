/* eslint-disable react-native/no-inline-styles */
import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
  FunctionComponent,
  PropsWithChildren,
} from 'react';
import {Dimensions} from 'react-native';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import BottomSheet, {
  BottomSheetHandleProps,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import {px2dp} from '../../utils/units';
import {SheetHandle} from '.';
import {AppColors} from '../../config';

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
  const [shouldRender, setShouldRender] = useState<boolean>(false);
  const isOpenRef = useRef<boolean>(isOpen);
  const bottomSheetRef = useRef<BottomSheet | null>(null);
  const snapPoints = useMemo(
    () => [Dimensions.get('window').height - px2dp(49) - statusBarHeight],
    [statusBarHeight],
  );
  isOpenRef.current = isOpen;

  // Hack solution since expand() doesn't always expand.
  const expand = (count = 0) => {
    if (isOpenRef.current && count < 1000) {
      bottomSheetRef.current?.expand();
      setTimeout(() => expand(count + 1));
    }
  };

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      expand();
    } else {
      bottomSheetRef.current?.close();
      setTimeout(() => {
        setShouldRender(false);
      }, 250);
    }
  }, [isOpen]);

  return shouldRender ? (
    <BottomSheet
      backgroundStyle={{
        backgroundColor: AppColors.background[1],
      }}
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      handleComponent={handleComponentFn(title, onClose, onBack)}>
      <BottomSheetScrollView contentContainerStyle={{minHeight: '100%'}}>
        {children}
      </BottomSheetScrollView>
    </BottomSheet>
  ) : null;
};
