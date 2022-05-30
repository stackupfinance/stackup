import React, {ReactElement, PropsWithChildren} from 'react';
import {HStack} from 'native-base';

export const TabScreenHeader = ({
  children,
}: PropsWithChildren<{}>): ReactElement => {
  return (
    <HStack justifyContent="space-between" alignItems="center">
      {children}
    </HStack>
  );
};
