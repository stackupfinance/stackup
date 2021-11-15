import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import { PageContainer, AppContainer, Head, Search, AccountTab } from '../components';
import { useAccountStore, accountHomePageSelector } from '../src/state';

export default function Home() {
  const { isEnabled, loading, logout } = useAccountStore(accountHomePageSelector);

  return (
    <>
      <Head title="Stackup | Home" />

      <PageContainer>
        <Search />

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
              <TabPanel>
                <p>chats placeholder</p>
              </TabPanel>
              <TabPanel px="0px">
                <AccountTab isEnabled={isEnabled} isLoading={loading} onLogout={logout} />
              </TabPanel>
            </TabPanels>

            <TabList
              borderWidth="1px"
              borderTopRadius="lg"
              borderBottomRadius={['0', 'lg']}
              p="8px"
              pos="absolute"
              bottom={['0px', '32px']}
              left={['0px', 'auto']}
              maxW="544px"
              w="100%"
            >
              <Tab borderRadius="lg">Chats</Tab>
              <Tab borderRadius="lg">Account</Tab>
            </TabList>
          </Tabs>
        </AppContainer>
      </PageContainer>
    </>
  );
}
