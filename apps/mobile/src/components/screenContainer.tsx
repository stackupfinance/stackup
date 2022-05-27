import React, {ReactElement, PropsWithChildren} from 'react';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {Box, useColorModeValue} from 'native-base';
import {px2dp} from '../utils/units';

export const ScreenContainer = ({
  children,
}: PropsWithChildren<{}>): ReactElement => {
  const statusBarHeight = getStatusBarHeight(true);
  return (
    <Box
      flex={1}
      mt={statusBarHeight + px2dp(53)}
      bg={useColorModeValue('warmGray.50', 'background.1')}>
      {children}
    </Box>
  );
};
