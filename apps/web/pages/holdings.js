import { useEffect } from 'react';
import { Tabs, TabList, TabPanels, Tab, TabPanel, VStack, Box } from '@chakra-ui/react';
import {
  PageContainer,
  AppContainer,
  Head,
  NavigationHeader,
  HoldingsOverview,
  List,
  TokenCard,
} from '../src/components';
import {
  useAccountStore,
  accountHoldingsPageSelector,
  useHoldingsStore,
  holdingsHoldingsPageSelector,
} from '../src/state';
import { Routes } from '../src/config';

const holdingsLoadingList = [
  [
    <TokenCard
      key="holdings-loading-token-list-1"
      isLoading
      isFirst
      name="Generic Token"
      logo="./mark-blue.png"
      valueWei="1000000000000000000"
      symbol="MATIC"
      decimals="18"
      valueUsdc="1800000"
    />,
    <TokenCard
      key="holdings-loading-token-list-2"
      isLoading
      name="Generic Token"
      logo="./mark-blue.png"
      valueWei="1000000000000000000"
      symbol="MATIC"
      decimals="18"
      valueUsdc="1800000"
    />,
    <TokenCard
      key="holdings-loading-token-list-3"
      isLoading
      isLast
      name="Generic Token"
      logo="./mark-blue.png"
      valueWei="1000000000000000000"
      symbol="MATIC"
      decimals="18"
      valueUsdc="1800000"
    />,
  ],
];

export default function Holdings() {
  const {
    loading: accountLoading,
    enabled,
    user,
    wallet,
    accessToken,
  } = useAccountStore(accountHoldingsPageSelector);
  const {
    loading: holdingsLoading,
    holdings,
    fetchHoldings,
  } = useHoldingsStore(holdingsHoldingsPageSelector);

  useEffect(() => {
    if (!enabled) return;
    fetchHoldings({ userId: user.id, accessToken: accessToken.token, walletAddress: wallet.walletAddress });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const renderTokenList = () => {
    const tokenList = holdings?.tokenList ?? [];
    return tokenList.map((token, i) => (
      <TokenCard
        key={`holdings-token-list-${i}`}
        isFirst={i === 0}
        isLast={i === tokenList.length - 1}
        {...token}
      />
    ));
  };

  return (
    <>
      <Head title="Stackup | Holdings" />

      <PageContainer>
        <NavigationHeader title="Holdings" backLinkUrl={Routes.HOME} />

        <AppContainer minMargin>
          <VStack spacing="16px" w="100%">
            <HoldingsOverview
              isLoading={!enabled || accountLoading || holdingsLoading}
              username={enabled ? user?.username : undefined}
              totalEquityUsdc={enabled ? holdings?.totalEquityUsdc : undefined}
            />

            <Tabs
              id="holdings-tabs"
              isFitted
              w="100%"
              variant="soft-rounded"
              colorScheme="blue"
              align="center"
            >
              <TabList borderWidth="1px" borderRadius="lg" p="4px" bg="gray.50">
                <Tab borderRadius="lg" fontSize="sm">
                  Tokens
                </Tab>

                <Tab borderRadius="lg" fontSize="sm">
                  NFTs
                </Tab>
              </TabList>

              <TabPanels>
                <TabPanel px="0px" mb="80px">
                  <Box borderWidth="1px" borderRadius="lg">
                    <List
                      items={
                        !enabled || accountLoading || holdingsLoading
                          ? holdingsLoadingList
                          : renderTokenList()
                      }
                      hasMore={false}
                      next={() => {}}
                      emptyHeading="No tokens yet 🆕"
                    />
                  </Box>
                </TabPanel>

                <TabPanel px="0px" mb="80px">
                  <Box borderWidth="1px" borderRadius="lg">
                    <List
                      items={[]}
                      hasMore={false}
                      next={() => {}}
                      emptyHeading="NFT display coming soon 🖼"
                    />
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        </AppContainer>
      </PageContainer>
    </>
  );
}
