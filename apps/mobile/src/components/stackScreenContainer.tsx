/* eslint-disable react-native/no-inline-styles */
import React, {ReactElement, PropsWithChildren} from 'react';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {Box, ScrollView} from 'native-base';
import {px2dp} from '../utils/units';

export const StackScreenContainer = ({
  children,
}: PropsWithChildren<{}>): ReactElement => {
  const statusBarHeight = getStatusBarHeight(true);
  return (
    <ScrollView
      pt={statusBarHeight + px2dp(58)}
      px="18px"
      contentContainerStyle={{minHeight: '100%'}}>
      {children}
      <Box mb="47px" />
    </ScrollView>
  );
};
