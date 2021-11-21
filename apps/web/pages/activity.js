import { useEffect, useState } from 'react';
import { Box, Button } from '@chakra-ui/react';
import { PageContainer, AppContainer, Head, ActivityHeader, List } from '../src/components';
import {
  useSearchStore,
  searchActivityPageSelector,
  useActivityStore,
  activityActivityPageSelector,
  useAccountStore,
  accountActivityPageSelector,
} from '../src/state';
import { Routes } from '../src/config';

export default function Activity() {
  const { enabled, user, accessToken } = useAccountStore(accountActivityPageSelector);
  const {
    // loading: activityLoading,
    // savedActivity,
    findOrCreateActivity,
  } = useActivityStore(activityActivityPageSelector);
  const { clear: clearSearch, selectedResult } = useSearchStore(searchActivityPageSelector);
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (!enabled) return;

    if (selectedResult) {
      setUsername(selectedResult.username);
      findOrCreateActivity(selectedResult.id, {
        userId: user.id,
        accessToken: accessToken.token,
      }).then(() => clearSearch());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return (
    <>
      <Head title="Stackup | Activity" />

      <PageContainer>
        <ActivityHeader backLinkUrl={Routes.HOME} username={username} />

        <AppContainer minMargin>
          <Box px="0px" mb={['64px', '128px']}>
            <List
              items={[]}
              hasMore={false}
              next={() => {}}
              emptyHeading="No activity! Make a payment to get started 🤝"
            />
          </Box>
          <Box
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
            <Button isFullWidth colorScheme="blue">
              Pay
            </Button>
          </Box>
        </AppContainer>
      </PageContainer>
    </>
  );
}
