import React, {ReactElement, PropsWithChildren} from 'react';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {Box} from 'native-base';
import {px2dp} from '../utils/units';

type Props = {
  noPadding?: boolean;
};

export const TabScreenContainer = ({
  children,
  noPadding,
}: PropsWithChildren<Props>): ReactElement => {
  const statusBarHeight = getStatusBarHeight(true);
  return (
    <Box
      flex={1}
      mt={statusBarHeight + px2dp(53)}
      px={noPadding ? undefined : '18px'}>
      {children}
    </Box>
  );
};
