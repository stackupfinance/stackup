import React, {ReactElement, PropsWithChildren} from 'react';
import {HStack} from 'native-base';

type Props = {
  withPadding?: boolean;
};

export const TabScreenHeader = ({
  children,
  withPadding,
}: PropsWithChildren<Props>): ReactElement => {
  return (
    <HStack
      justifyContent="space-between"
      alignItems="center"
      px={withPadding ? '18px' : undefined}>
      {children}
    </HStack>
  );
};
