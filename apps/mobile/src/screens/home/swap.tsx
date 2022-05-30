import * as React from 'react';
import {Heading} from 'native-base';
import type {MaterialTopTabScreenProps} from '@react-navigation/material-top-tabs';
import {HomeTabParamList} from '../../config';
import {TabScreenContainer, TabScreenHeader} from '../../components';

type Props = MaterialTopTabScreenProps<HomeTabParamList, 'Swap'>;

export default function SwapScreen({}: Props) {
  return (
    <TabScreenContainer>
      <TabScreenHeader>
        <Heading fontSize="16px" fontFamily="heading">
          Swap
        </Heading>
      </TabScreenHeader>
    </TabScreenContainer>
  );
}
