import React, {ReactElement, PropsWithChildren} from 'react';
import {HStack} from 'native-base';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {px2dp} from '../utils/units';

type Props = {};

export const TabScreenHeader = ({
  children,
}: PropsWithChildren<Props>): ReactElement => {
  const statusBarHeight = getStatusBarHeight(true);
  return (
    <HStack
      justifyContent="space-between"
      alignItems="center"
      px="18px"
      pb="18px"
      pt={statusBarHeight + px2dp(53)}>
      {children}
    </HStack>
  );
};
