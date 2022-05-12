import * as React from 'react';
import {Heading} from 'native-base';
import type {MaterialTopTabScreenProps} from '@react-navigation/material-top-tabs';
import {HomeTabParamList} from '../../config';
import {ScreenContainer, ScreenHeader} from '../../components';

type Props = MaterialTopTabScreenProps<HomeTabParamList, 'Swap'>;

export default function SwapScreen({}: Props) {
  return (
    <ScreenContainer>
      <ScreenHeader>
        <Heading fontSize={16} fontFamily="heading">
          Swap
        </Heading>
      </ScreenHeader>
    </ScreenContainer>
  );
}
