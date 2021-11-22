import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import {
  PageContainer,
  AppContainer,
  Head,
  Search,
  AccountTab,
  List,
  UserCard,
} from '../src/components';
import {
  useAccountStore,
  accountHomePageSelector,
  useSearchStore,
  searchHomePageSelector,
  useWalletStore,
  walletHomePageSelector,
} from '../src/state';
import { useActivityChannel, useLogout } from '../src/hooks';
import { Routes } from '../src/config';

const loadingList = [
  <UserCard
    key="loading-card-1"
    isLoading
    isFirst
    username="username"
    preview="preview"
    timestamp="timestamp"
  />,
  <UserCard
    key="loading-card-2"
    isLoading
    username="username"
    preview="preview"
    timestamp="timestamp"
  />,
  <UserCard
    key="loading-card-3"
    isLoading
    isLast
    username="username"
    preview="preview"
    timestamp="timestamp"
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
    selectResult,
    clearSearchData,
  } = useSearchStore(searchHomePageSelector);
  const { loading: walletLoading, balance, fetchBalance } = useWalletStore(walletHomePageSelector);
  const logout = useLogout();
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    router.prefetch(Routes.ACTIVITY);
  }, [router]);

  useEffect(() => {
    if (enabled) {
      // TODO: Get user activity
      fetchBalance(wallet);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  useActivityChannel((_data) => {
    // TODO: Update user activity
  });

  const onSearch = async (query) => {
    if (!enabled) return;

    setShowSearch(true);
    setSearchQuery(query);
    searchByUsername(query, { userId: user.id, accessToken: accessToken.token });
  };

  const onClear = async () => {
    setShowSearch(false);
    setSearchQuery('');
    clearSearchData();
  };

  const searchResultsNextHandler = async () => {
    fetchNextPage(searchQuery, { userId: user.id, accessToken: accessToken.token });
  };

  const activityNextHandler = async () => {
    // TODO: Fetch next activity page
  };

  const logoutHandler = async () => {
    logout();
  };

  const onSearchResultHandler = (result) => {
    selectResult(result);
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

  return (
    <>
      <Head title="Stackup | Home" />

      <PageContainer>
        <Search onSearch={onSearch} onClear={onClear} />

        <AppContainer minMargin>
          <Tabs
            id="home-tabs"
            isFitted
            w="100%"
            variant="soft-rounded"
            colorScheme="blue"
            align="center"
          >
            <TabPanels>
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
                    // TODO: if !enabled || activityLoading
                    items={!enabled ? loadingList : []}
                    hasMore={false}
                    next={activityNextHandler}
                    listHeading="Latest activity"
                    emptyHeading="No activity yet. Search for a user to get started! 🚀"
                  />
                )}
              </TabPanel>
              <TabPanel px="0px">
                <AccountTab
                  isEnabled={enabled}
                  isAccountLoading={accountLoading}
                  isWalletLoading={walletLoading}
                  onLogout={logoutHandler}
                  walletBalance={balance}
                  walletAddress={wallet?.walletAddress}
                />
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
              <Tab borderRadius="lg">Pay</Tab>
              <Tab borderRadius="lg">Account</Tab>
            </TabList>
          </Tabs>
        </AppContainer>
      </PageContainer>
    </>
  );
}
