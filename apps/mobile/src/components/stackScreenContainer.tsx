/* eslint-disable react-native/no-inline-styles */
import React, {ReactElement, PropsWithChildren} from 'react';
import {Platform} from 'react-native';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {Box, KeyboardAvoidingView, ScrollView} from 'native-base';
import {px2dp} from '../utils/units';

export const StackScreenContainer = ({
  children,
}: PropsWithChildren<{}>): ReactElement => {
  const statusBarHeight = getStatusBarHeight(true);
  return (
    <KeyboardAvoidingView
      flex={1}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        pt={statusBarHeight + px2dp(58)}
        px="18px"
        contentContainerStyle={{minHeight: '100%'}}>
        {children}
        <Box mb="47px" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
