import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import {
  PageContainer,
  AppContainer,
  Head,
  Search,
  AccountOverview,
  List,
  TransactionCard,
  TransactionDateDivider,
  UserCard,
  Notifications,
} from '../src/components';
import {
  useAccountStore,
  accountHomePageSelector,
  useSearchStore,
  searchHomePageSelector,
  useWalletStore,
  walletHomePageSelector,
  useActivityStore,
  activityHomePageSelector,
  useOnboardStore,
  onboardHomePageSelector,
  useRecoverStore,
  recoverHomePageSelector,
  useNotificationStore,
  notificationHomePageSelector,
  useUpdateStore,
  updateHomePageSelector,
  useHistoryStore,
  historyHomePageSelector,
} from '../src/state';
import { useAuthChannel, useLogout } from '../src/hooks';
import { txType, getActivityId } from '../src/utils/transaction';
import { Routes } from '../src/config';
import { EVENTS, logEvent } from '../src/utils/analytics';

const tabs = {
  EXPLORE: 0,
  PAY: 1,
};

const loadingList = [
  <UserCard
    key="loading-card-1"
    isLoading
    isFirst
    username="username"
    preview="preview"
    timestamp={new Date('2021-01-01T00:00:00')}
  />,
  <UserCard
    key="loading-card-2"
    isLoading
    username="username"
    preview="preview"
    timestamp={new Date('2021-01-01T00:00:00')}
  />,
  <UserCard
    key="loading-card-3"
    isLoading
    isLast
    username="username"
    preview="preview"
    timestamp={new Date('2021-01-01T00:00:00')}
  />,
];

export default function Home() {
  const {
    enabled,
    loading: accountLoading,
    user,
    wallet,
    accessToken,
  } = useAccountStore(accountHomePageSelector);
  const {
    loading: searchLoading,
    searchData,
    searchByUsername,
    fetchNextPage,
    hasMore,
    clearSearchData,
  } = useSearchStore(searchHomePageSelector);
  const { loading: walletLoading, balance, fetchBalance } = useWalletStore(walletHomePageSelector);
  const {
    loading: activityLoading,
    activityList,
    fetchActivities,
    selectActivity,
    updateActivityListFromChannel,
  } = useActivityStore(activityHomePageSelector);
  const {
    loading: notificationLoading,
    notifications: savedNotifications,
    fetchNotifications,
    deleteNotification,
  } = useNotificationStore(notificationHomePageSelector);
  const {
    // loading: historyLoading,
    // transactions,
    fetchTransactions,
  } = useHistoryStore(historyHomePageSelector);
  const { clear: clearOnboardData } = useOnboardStore(onboardHomePageSelector);
  const { clear: clearRecover, selectGuardianRequest } = useRecoverStore(recoverHomePageSelector);
  const { clear: clearUpdate } = useUpdateStore(updateHomePageSelector);
  const logout = useLogout();
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tabIndex, setTabIndex] = useState(tabs.EXPLORE);
  const [notifications, setNotifications] = useState([]);
  const [username, setUsername] = useState('');
  const [initLoad, setInitLoad] = useState(true);

  useEffect(() => {
    setNotifications(savedNotifications);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedNotifications]);

  useEffect(() => {
    router.prefetch(Routes.LOGIN);
    router.prefetch(Routes.ACTIVITY);
    router.prefetch(Routes.RECOVER_APPROVE_REQUEST);
  }, [router]);

  useEffect(() => {
    if (!enabled) return;
    if (!user.isOnboarded) {
      router.push(Routes.ONBOARD_RECOVERY);
      return;
    }
    clearOnboardData();
    clearRecover();
    clearUpdate();
    setUsername(user.username);
    fetchActivities({ userId: user.id, accessToken: accessToken.token });
    fetchNotifications({ userId: user.id, accessToken: accessToken.token });
    fetchTransactions({ userId: user.id, accessToken: accessToken.token });
    fetchBalance(wallet);
    setInitLoad(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  useAuthChannel((event, data) => {
    if (event === txType.newPayment) {
      updateActivityListFromChannel(data, { userId: user.id, accessToken: accessToken.token });
      fetchBalance(wallet);
    } else if (event === txType.recoverAccount) {
      fetchNotifications({ userId: user.id, accessToken: accessToken.token });
    } else if (event === txType.genericRelay) {
      fetchBalance(wallet);
    }
  });

  const onNotificationClick = async (notification) => {
    if (notification.type === txType.recoverAccount) {
      selectGuardianRequest({ notificationId: notification.id, ...notification.data });
      logEvent(EVENTS.RECOVER_ACCOUNT_GUARDIAN_GO_TO_APPROVE);
      router.push(Routes.RECOVER_APPROVE_REQUEST);
    }
  };

  const onDeleteNotification = async (notification) => {
    if (!enabled) return;

    deleteNotification(notification.id, { userId: user.id, accessToken: accessToken.token });
  };

  const onSearch = async (query) => {
    if (!enabled) return;

    setTabIndex(tabs.PAY);
    setShowSearch(true);
    setSearchQuery(query);
    searchByUsername(query, { userId: user.id, accessToken: accessToken.token });
    logEvent(EVENTS.SEARCH_START);
  };

  const onClear = async () => {
    setShowSearch(false);
    setSearchQuery('');
    clearSearchData();
    logEvent(EVENTS.SEARCH_CLEAR);
  };

  const searchResultsNextHandler = async () => {
    fetchNextPage(searchQuery, { userId: user.id, accessToken: accessToken.token });
  };

  const activityNextHandler = async () => {
    // TODO: Fetch next activity page
  };

  const logoutHandler = async () => {
    logout();
    logEvent(EVENTS.LOGOUT);
  };

  const onSearchResultHandler = (result) => {
    selectActivity({
      id: getActivityId(wallet.walletAddress, result.wallet.walletAddress),
      toUser: { username: result.username, walletAddress: result.wallet.walletAddress },
    });
    logEvent(EVENTS.GO_TO_SEARCH_RESULT);
    router.push(Routes.ACTIVITY);
  };

  const onActivityHandler = (activity) => {
    selectActivity(activity);
    logEvent(EVENTS.GOT_TO_ACTIVITY_ITEM);
    router.push(Routes.ACTIVITY);
  };

  const renderSearchResults = (results = []) => {
    return results.map((result, i) => {
      return (
        <UserCard
          key={`search-result-list-item-${i}`}
          isFirst={i === 0}
          isLast={i === results.length - 1}
          username={result.username}
          onClick={() => onSearchResultHandler(result)}
        />
      );
    });
  };

  const renderActivityList = (results = []) => {
    return results.map((result, i) => {
      return (
        <UserCard
          key={`activity-list-item-${i}`}
          isFirst={i === 0}
          isLast={i === results.length - 1}
          username={result.toUser.username}
          onClick={() => onActivityHandler(result)}
          preview={result.preview}
          timestamp={result.updatedAt}
        />
      );
    });
  };

  const handleTabsChange = (index) => {
    setTabIndex(index);
  };

  return (
    <>
      <Head title="Stackup | Home" />

      <PageContainer>
        <Search
          onSearch={onSearch}
          onClear={onClear}
          rightItem={
            <Notifications
              isLoading={notificationLoading}
              items={notifications}
              onItemClick={onNotificationClick}
              onDeleteItem={onDeleteNotification}
            />
          }
        />

        <AppContainer minMargin>
          <Tabs
            id="home-tabs"
            isFitted
            w="100%"
            variant="soft-rounded"
            colorScheme="blue"
            align="center"
            index={tabIndex}
            onChange={handleTabsChange}
          >
            <TabPanels>
              <TabPanel px="0px" mb="80px">
                <AccountOverview
                  isEnabled={enabled}
                  isAccountLoading={accountLoading}
                  isWalletLoading={initLoad || walletLoading}
                  onLogout={logoutHandler}
                  walletBalance={balance}
                  walletAddress={wallet?.walletAddress}
                  username={username}
                  transactionsContent={
                    <List
                      items={[
                        <TransactionDateDivider
                          key="transaction-history-0"
                          timestamp={new Date()}
                        />,
                        <TransactionCard
                          key="transaction-history-0-1"
                          effect="You approved paymaster for $5"
                          fee="80000"
                          extraLineItems={[{ name: 'Jane', value: '$3.84' }]}
                          timestamp={new Date('2021-01-01T00:00:00')}
                        />,
                        <TransactionCard
                          key="transaction-history-1-1"
                          isIncoming
                          effect="Bob approved you for $2.50"
                          timestamp={new Date('2021-01-01T00:00:00')}
                        />,
                        <TransactionCard
                          key="transaction-history-2-1"
                          effect="Recovered account with 2 guardians"
                          fee="80000"
                          timestamp={new Date('2021-01-01T00:00:00')}
                        />,
                        <TransactionCard
                          key="transaction-history-1"
                          name="alice"
                          value="1500000"
                          fee="80000"
                          timestamp={new Date('2021-01-01T00:00:00')}
                        />,
                        <TransactionCard
                          key="transaction-history-2"
                          isLastInSection
                          name="johnrising.eth"
                          value="25320000"
                          fee="100000"
                          timestamp={new Date('2021-01-01T00:00:00')}
                        />,
                        <TransactionDateDivider
                          key="transaction-history-3"
                          timestamp={new Date('2022-01-18T00:00:00')}
                        />,
                        <TransactionCard
                          key="transaction-history-4"
                          isIncoming
                          name="0x619...0B6dE"
                          value="1000000"
                          timestamp={new Date('2021-01-01T00:00:00')}
                        />,
                        <TransactionCard
                          key="transaction-history-5"
                          name="UniSwap V3"
                          value="150000000"
                          fee="160000"
                          extraLineItems={[{ name: 'WETH', value: '0.12 ETH', isIncoming: true }]}
                          timestamp={new Date('2021-01-01T00:00:00')}
                        />,
                        <TransactionCard
                          key="transaction-history-6"
                          name="OpenSea"
                          value="1500000000"
                          fee="160000"
                          extraLineItems={[{ name: 'BAYC', value: '#13152', isIncoming: true }]}
                          timestamp={new Date('2021-01-01T00:00:00')}
                        />,
                        <TransactionCard
                          key="transaction-history-7"
                          isLastInList
                          name="Aave"
                          value="1500000000"
                          fee="160000"
                          extraLineItems={[{ name: 'amUSDC', value: '$150.00', isIncoming: true }]}
                          timestamp={new Date('2021-01-01T00:00:00')}
                        />,
                      ]}
                      hasMore={false}
                      next={() => {}}
                      emptyHeading="No wallet activity yet! 🆕"
                    />
                  }
                />
              </TabPanel>

              <TabPanel px="0px" mb={['64px', '128px']}>
                {showSearch ? (
                  <List
                    items={searchLoading ? loadingList : renderSearchResults(searchData?.results)}
                    hasMore={hasMore()}
                    next={searchResultsNextHandler}
                    listHeading="Search results"
                    emptyHeading="No results! Try a different username 🔎"
                  />
                ) : (
                  <List
                    items={
                      !enabled || activityLoading
                        ? loadingList
                        : renderActivityList(activityList?.results)
                    }
                    hasMore={false}
                    next={activityNextHandler}
                    listHeading="Latest activity"
                    emptyHeading="No activity yet. Search for a user to get started! 🚀"
                  />
                )}
              </TabPanel>
            </TabPanels>

            <TabList
              bg="gray.50"
              borderWidth="1px"
              borderTopRadius="lg"
              borderBottomRadius={['0', 'lg']}
              p="8px"
              pos="fixed"
              bottom={['0px', '32px']}
              left={['0px', 'auto']}
              maxW="544px"
              w="100%"
            >
              <Tab borderRadius="lg">Account</Tab>

              <Tab borderRadius="lg">Activity</Tab>
            </TabList>
          </Tabs>
        </AppContainer>
      </PageContainer>
    </>
  );
}
