import React, {ReactElement, PropsWithChildren} from 'react';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {Box} from 'native-base';
import {px2dp} from '../utils/units';

export const TabScreenContainer = ({
  children,
}: PropsWithChildren<{}>): ReactElement => {
  const statusBarHeight = getStatusBarHeight(true);
  return (
    <Box flex={1} mt={statusBarHeight + px2dp(53)} px="18px">
      {children}
    </Box>
  );
};
