import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import { AppContainer, Head, Search } from '../components';

export default function Home() {
  return (
    <>
      <Head title="Stackup | Home" />

      <div style={{ minHeight: '100vh' }}>
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
              <TabPanel>
                <p>Profile placeholder</p>
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
              maxW="xl"
              w="100%"
            >
              <Tab borderRadius="lg">Chats</Tab>
              <Tab borderRadius="lg">Profile</Tab>
            </TabList>
          </Tabs>
        </AppContainer>
      </div>
    </>
  );
}
