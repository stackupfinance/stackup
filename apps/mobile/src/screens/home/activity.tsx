import React, {ReactElement} from 'react';
import {Box} from 'native-base';
import type {MaterialTopTabScreenProps} from '@react-navigation/material-top-tabs';
import {fromUnixTime, format} from 'date-fns';
import {HomeTabParamList, KnownAddresses} from '../../config';
import {
  TabScreenContainer,
  TabScreenHeader,
  HomeTabTitle,
  List,
  ActivityItem,
  NoActivityItem,
} from '../../components';
import {
  useExplorerStoreActivitySelector,
  useSettingsStoreActivitySelector,
  useWalletStoreActivitySelector,
} from '../../state';

type Props = MaterialTopTabScreenProps<HomeTabParamList, 'Activity'>;

export default function ActivityScreen({}: Props) {
  const {
    loading: isExplorerLoading,
    activity,
    fetchAddressOverview,
  } = useExplorerStoreActivitySelector();
  const {network, quoteCurrency, timePeriod} =
    useSettingsStoreActivitySelector();
  const {instance} = useWalletStoreActivitySelector();

  const onRefresh = () => {
    fetchAddressOverview(
      network,
      quoteCurrency,
      timePeriod,
      instance.walletAddress,
    );
  };

  const renderActivitySections = () => {
    return activity.length
      ? activity.reduce<Array<{title: string; data: Array<ReactElement>}>>(
          (prev, curr, i) => {
            if (
              !prev[prev.length - 1] ||
              prev[prev.length - 1].title !==
                format(fromUnixTime(curr.timestamp), 'MMM d, yyyy')
            ) {
              return [
                ...prev,
                {
                  title: format(fromUnixTime(curr.timestamp), 'MMM d, yyyy'),
                  data: [
                    <ActivityItem
                      key={`activity-item-${i}`}
                      currency={curr.currency}
                      type={curr.type}
                      value={curr.value}
                      from={KnownAddresses[curr.from] ?? curr.from}
                      to={KnownAddresses[curr.to] ?? curr.to}
                    />,
                  ],
                },
              ];
            } else {
              prev[prev.length - 1].data.push(
                <ActivityItem
                  key={`activity-item-${i}`}
                  currency={curr.currency}
                  type={curr.type}
                  value={curr.value}
                  from={KnownAddresses[curr.from] ?? curr.from}
                  to={KnownAddresses[curr.to] ?? curr.to}
                />,
              );
              return prev;
            }
          },
          [],
        )
      : [{title: '', data: [<NoActivityItem />]}];
  };

  return (
    <TabScreenContainer>
      <TabScreenHeader>
        <Box />

        <HomeTabTitle screen="Activity" network={network} />

        <Box />
      </TabScreenHeader>

      <List
        onRefresh={onRefresh}
        isRefreshing={isExplorerLoading}
        header={<Box mt="23px" />}
        sections={renderActivitySections()}
      />
    </TabScreenContainer>
  );
}
