import React, {ReactElement, PropsWithChildren} from 'react';
import {Box} from 'native-base';

type Props = {};

export const TabScreenContainer = ({
  children,
}: PropsWithChildren<Props>): ReactElement => {
  return <Box flex={1}>{children}</Box>;
};
