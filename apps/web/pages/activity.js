import { useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { PageContainer, AppContainer, Head, ActivityHeader, List, Pay } from '../src/components';
import {
  useSearchStore,
  searchActivityPageSelector,
  useActivityStore,
  activityActivityPageSelector,
  useAccountStore,
  accountActivityPageSelector,
  useWalletStore,
  walletActivityPageSelector,
} from '../src/state';
import { Routes } from '../src/config';

export default function Activity() {
  const { enabled, user, wallet, accessToken } = useAccountStore(accountActivityPageSelector);
  const {
    // loading: activityLoading,
    savedActivity,
    findOrCreateActivity,
    clearSavedActivity,
  } = useActivityStore(activityActivityPageSelector);
  const { clear: clearSearch, selectedResult } = useSearchStore(searchActivityPageSelector);
  const {
    loading: walletLoading,
    balance,
    fetchBalance,
    sendNewPayment,
  } = useWalletStore(walletActivityPageSelector);
  const [username, setUsername] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [payError, setPayError] = useState('');

  useEffect(() => {
    if (!enabled) return;

    if (selectedResult) {
      findOrCreateActivity(selectedResult.id, {
        userId: user.id,
        accessToken: accessToken.token,
      }).then(() => clearSearch());
    }

    fetchBalance(wallet);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  useEffect(() => {
    if (!savedActivity) return '';

    const toUser = savedActivity.users.find((curr) => curr.id !== user.id);
    setUsername(toUser.username);
    setWalletAddress(toUser.wallet.walletAddress);

    return clearSavedActivity;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedActivity]);

  const onConfirmHandler = async (data) => {
    setPayError('');

    try {
      await sendNewPayment(wallet, data, { userId: user.id, accessToken: accessToken.token });
    } catch (error) {
      setPayError(error.message);
    }
  };

  const onCancelHandler = () => {
    setPayError('');
  };

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
          <Pay
            isLoading={walletLoading}
            toUser={username}
            toWalletAddress={walletAddress}
            onConfirm={onConfirmHandler}
            onCancel={onCancelHandler}
            error={payError}
            walletBalance={balance}
          />
        </AppContainer>
      </PageContainer>
    </>
  );
}
