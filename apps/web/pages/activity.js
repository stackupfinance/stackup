import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box } from '@chakra-ui/react';
import {
  PageContainer,
  AppContainer,
  Head,
  ActivityHeader,
  List,
  Pay,
  NewPaymentCard,
} from '../src/components';
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
import { useActivityChannel } from '../src/hooks';
import { Routes } from '../src/config';

const loadingList = [
  <NewPaymentCard
    key="loading-payment-1"
    isFirst
    isLoading
    toUsername="username"
    amount="$0.00"
    message="message"
  />,
  <NewPaymentCard
    key="loading-payment-2"
    isLoading
    fromUsername="username"
    amount="$0.00"
    message="message"
  />,
];

export default function Activity() {
  const { enabled, user, wallet, accessToken } = useAccountStore(accountActivityPageSelector);
  const {
    loading: activityLoading,
    savedActivity,
    findOrCreateActivity,
    clearSavedActivity,
    createActivityItem,
  } = useActivityStore(activityActivityPageSelector);
  const { clear: clearSearch, selectedResult } = useSearchStore(searchActivityPageSelector);
  const {
    loading: walletLoading,
    balance,
    fetchBalance,
    signNewPaymentUserOps,
  } = useWalletStore(walletActivityPageSelector);
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [payError, setPayError] = useState('');

  useActivityChannel((_data) => {});

  useEffect(() => {
    if (!enabled) return;

    if (selectedResult) {
      findOrCreateActivity(selectedResult.id, {
        userId: user.id,
        accessToken: accessToken.token,
      }).then(() => clearSearch());
    } else if (!selectedResult && !savedActivity) {
      router.push(Routes.HOME);
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
      const userOps = await signNewPaymentUserOps(wallet, data, {
        userId: user.id,
        accessToken: accessToken.token,
      });
      await createActivityItem(userOps, { userId: user.id, accessToken: accessToken.token });
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
          <Box px="0px" w="100%">
            <List
              isInverse={activityLoading}
              items={activityLoading ? loadingList : []}
              hasMore={false}
              next={() => {}}
              emptyHeading="No activity! Make a payment to get started 🤝"
            />
          </Box>
          <Pay
            isLoading={walletLoading || activityLoading}
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
