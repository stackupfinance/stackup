import * as React from 'react';
import {Heading} from 'native-base';
import type {MaterialTopTabScreenProps} from '@react-navigation/material-top-tabs';
import {HomeTabParamList} from '../../config';
import {TabScreenContainer, TabScreenHeader} from '../../components';

type Props = MaterialTopTabScreenProps<HomeTabParamList, 'Activity'>;

export default function ActivityScreen({}: Props) {
  return (
    <TabScreenContainer>
      <TabScreenHeader>
        <Heading fontSize="16px" fontFamily="heading">
          Activity
        </Heading>
      </TabScreenHeader>
    </TabScreenContainer>
  );
}
