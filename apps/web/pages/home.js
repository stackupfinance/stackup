import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Tabs, TabList, TabPanels, Tab, TabPanel, HStack } from '@chakra-ui/react';
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
  Apps,
  Fiat,
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
  useAppsStore,
  appsHomePageSelector,
} from '../src/state';
import { useAuthChannel, useLogout } from '../src/hooks';
import { txType, getActivityId } from '../src/utils/transaction';
import { Routes } from '../src/config';
import { EVENTS, logEvent, openReplayTracker } from '../src/utils/analytics';

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

const historyLoadingList = [
  <TransactionDateDivider
    isLoading
    key="loading-history-1"
    timestamp={new Date('2021-01-01T00:00:00')}
  />,
  <TransactionCard
    isLoading
    key="loading-history-2"
    lineItems={[
      { to: 'name', value: '3500000' },
      { to: 'name', value: '3500000' },
    ]}
    fee="10000"
    timestamp={new Date('2021-01-01T00:00:00')}
  />,
  <TransactionCard
    isLoading
    isLastInSection
    key="loading-history-3"
    lineItems={[{ to: 'name', value: '3500000' }]}
    fee="10000"
    timestamp={new Date('2021-01-01T00:00:00')}
  />,
  <TransactionDateDivider
    isLoading
    key="loading-history-4"
    timestamp={new Date('2021-01-01T00:00:00')}
  />,
  <TransactionCard
    isLoading
    key="loading-history-5"
    lineItems={[{ to: 'name', value: '3500000' }]}
    fee="10000"
    timestamp={new Date('2021-01-01T00:00:00')}
  />,
  <TransactionCard
    isLoading
    isLastInList
    key="loading-history-6"
    lineItems={[
      { to: 'name', value: '3500000' },
      { to: 'name', value: '3500000' },
    ]}
    fee="10000"
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
    searchForAccount,
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
    loading: historyLoading,
    transactions,
    fetchTransactions,
  } = useHistoryStore(historyHomePageSelector);
  const {
    loading: appsLoading,
    sessions,
    callRequestQueue,
    connectToApp,
    disconnectFromApp,
  } = useAppsStore(appsHomePageSelector);
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
    router.prefetch(Routes.HOLDINGS);
  }, [router]);

  useEffect(() => {
    if (!enabled) return;
    if (!user.isOnboarded) {
      router.push(Routes.ONBOARD_RECOVERY);
      return;
    }
    openReplayTracker.setUserID(user.username);
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
    fetchTransactions({ userId: user.id, accessToken: accessToken.token });
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
    searchForAccount(query, { userId: user.id, accessToken: accessToken.token });
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

  const onMoreHandler = () => {
    logEvent(EVENTS.GO_TO_HOLDINGS);
    router.push(Routes.HOLDINGS);
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
    logEvent(EVENTS.GO_TO_ACTIVITY_ITEM);
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

  const renderTransactionHistory = () => {
    return (transactions?.results || []).reduce((prev, curr, i) => {
      const isLastBatch = i === transactions.results.length - 1;

      const divider = (
        <TransactionDateDivider
          key={`history-date-divider-${i}`}
          timestamp={new Date(curr.lastDate)}
        />
      );

      const items = curr.transactions.map((tx, j) => {
        const isLastInSection = j === curr.transactions.length - 1;
        return (
          <TransactionCard
            isLastInSection={isLastInSection}
            isLastInList={isLastInSection && isLastBatch}
            key={`history-transaction-${i}-${j}`}
            lineItems={tx.lineItems}
            fee={tx.fee?.value}
            hash={tx.hash}
            status={tx.status}
            timestamp={tx.updatedAt}
          />
        );
      });

      return [...prev, divider, ...items];
    }, []);
  };

  const handleTabsChange = (index) => {
    setTabIndex(index);
  };

  const onAppConnectStart = () => {
    logEvent(EVENTS.WALLET_CONNECT_START);
  };

  const onAppConnectCancel = () => {
    logEvent(EVENTS.WALLET_CONNECT_CANCEL);
  };

  const onAppConnectWithQR = (uri) => {
    if (!enabled) return;

    logEvent(EVENTS.WALLET_CONNECT_WITH_QR);
    connectToApp(wallet.walletAddress, { uri });
  };

  const onAppConnectWithText = (uri) => {
    if (!enabled) return;

    logEvent(EVENTS.WALLET_CONNECT_WITH_TEXT);
    connectToApp(wallet.walletAddress, { uri });
  };

  const onAppDisconnect = (sessionId) => {
    logEvent(EVENTS.WALLET_CONNECT_DISCONNECT);
    disconnectFromApp(sessionId);
  };

  return (
    <>
      <Head title="Stackup" showNotification={initLoad ? false : callRequestQueue?.length > 0} />

      <PageContainer>
        <Search
          onSearch={onSearch}
          onClear={onClear}
          rightItem={
            <HStack spacing="8px">
              <Apps
                isLoading={appsLoading}
                sessions={initLoad ? [] : sessions}
                onAppConnectStart={onAppConnectStart}
                onAppConnectCancel={onAppConnectCancel}
                onAppConnectWithQR={onAppConnectWithQR}
                onAppConnectWithText={onAppConnectWithText}
                onAppDisconnect={onAppDisconnect}
              />
              <Notifications
                isLoading={notificationLoading}
                items={initLoad ? [] : notifications}
                onItemClick={onNotificationClick}
                onDeleteItem={onDeleteNotification}
              />
            </HStack>
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
                  onMore={onMoreHandler}
                  walletBalance={balance}
                  walletAddress={wallet?.walletAddress}
                  username={username}
                  walletCta={<Fiat isEnabled={enabled} />}
                  transactionsContent={
                    <List
                      items={
                        !enabled || historyLoading ? historyLoadingList : renderTransactionHistory()
                      }
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
