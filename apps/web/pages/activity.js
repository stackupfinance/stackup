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
import { useAuthChannel } from '../src/hooks';
import { Routes } from '../src/config';
import { getToUserFromActivity } from '../src/utils/activity';
import { displayUSDC } from '../src/utils/web3';
import { types } from '../src/utils/events';
import { EVENTS, logEvent } from '../src/utils/analytics';

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
    isReceiving
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
    activityItems,
    findOrCreateActivity,
    clearSavedActivity,
    createActivityItem,
    fetchActivityItems,
    updateActivityItemFromChannel,
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
  const isInverse = (activityItems?.results || []).length || activityLoading;

  useAuthChannel((event, data) => {
    if (event === types.newPayment) {
      updateActivityItemFromChannel(data);
      fetchBalance(wallet);
    }
  });

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

    const toUser = getToUserFromActivity(savedActivity, user.id);
    setUsername(toUser.username);
    setWalletAddress(toUser.wallet.walletAddress);
    fetchActivityItems({
      userId: user.id,
      accessToken: accessToken.token,
    });

    return clearSavedActivity;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedActivity]);

  const onPayHandler = () => {
    logEvent(EVENTS.OPEN_PAY);
  };

  const onSendHandler = () => {
    logEvent(EVENTS.SEND_PAY);
  };

  const onConfirmHandler = async (data) => {
    setPayError('');

    try {
      const userOps = await signNewPaymentUserOps(wallet, data, {
        userId: user.id,
        accessToken: accessToken.token,
      });
      await createActivityItem(userOps, data.amount, data.message, {
        userId: user.id,
        accessToken: accessToken.token,
      });
      fetchBalance(wallet);
      logEvent(EVENTS.CONFIRM_PAY);
    } catch (error) {
      setPayError(error.response?.data?.message || error.message);
      throw error;
    }
  };

  const onCancelHandler = () => {
    setPayError('');
  };

  const renderActivityItems = () => {
    if (!savedActivity) return [];
    const toUser = getToUserFromActivity(savedActivity, user.id);

    return (activityItems?.results || []).map((item, i) => {
      const isReceiving = item.toUser === user.id;
      const fromUsername = isReceiving ? toUser.username : user.username;
      const toUsername = isReceiving ? user.username : toUser.username;
      return (
        <NewPaymentCard
          key={`new-payment-card-${i}`}
          isFirst={i === 0}
          isReceiving={isReceiving}
          toUsername={toUsername}
          fromUsername={fromUsername}
          amount={displayUSDC(item.amount)}
          message={item.message}
          status={item.status}
        />
      );
    });
  };

  return (
    <>
      <Head title="Stackup | Activity" />

      <PageContainer>
        <ActivityHeader backLinkUrl={Routes.HOME} username={username} />

        <AppContainer minMargin>
          <Box px="0px" w="100%">
            <List
              isInverse={isInverse}
              items={activityLoading ? loadingList : renderActivityItems()}
              hasMore={false}
              next={() => {}}
              emptyHeading="No activity! Make a payment to get started 🤝"
            />
          </Box>
          <Pay
            isLoading={walletLoading || activityLoading}
            toUser={username}
            toWalletAddress={walletAddress}
            onPay={onPayHandler}
            onSend={onSendHandler}
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
