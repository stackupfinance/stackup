import React, {ReactElement, PropsWithChildren} from 'react';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {HStack} from 'native-base';
import {px2dp} from '../utils/units';

export const StackScreenHeader = ({
  children,
}: PropsWithChildren<{}>): ReactElement => {
  const statusBarHeight = getStatusBarHeight(true);
  return (
    <HStack
      justifyContent="space-between"
      alignItems="center"
      pt={statusBarHeight + px2dp(53)}
      pb="14px"
      px="19px"
      backgroundColor="background.3">
      {children}
    </HStack>
  );
};
