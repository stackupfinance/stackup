import { useEffect, useState } from 'react';
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
} from '../src/state';
import { useActivityChannel } from '../src/hooks';

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
    accessToken,
    logout,
  } = useAccountStore(accountHomePageSelector);
  const {
    loading: searchLoading,
    searchData,
    searchByUsername,
    fetchNextPage,
    hasMore,
    clear,
  } = useSearchStore(searchHomePageSelector);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (enabled) {
      // TODO: Get user activity
    }
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
    clear();
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

  const renderSearchResults = (results = []) => {
    return results.map((result, i) => {
      return (
        <UserCard
          key={`search-result-list-item-${i}`}
          isFirst={i === 0}
          isLast={i === results.length - 1}
          username={result.username}
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
                  isLoading={accountLoading}
                  onLogout={logoutHandler}
                />
              </TabPanel>
            </TabPanels>

            <TabList
              bg="white"
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
