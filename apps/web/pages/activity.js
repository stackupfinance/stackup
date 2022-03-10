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
  useActivityStore,
  activityActivityPageSelector,
  useAccountStore,
  accountActivityPageSelector,
  useWalletStore,
  walletActivityPageSelector,
} from '../src/state';
import { useAuthChannel } from '../src/hooks';
import { Routes } from '../src/config';
import { displayUSDC } from '../src/utils/web3';
import { txType } from '../src/utils/transaction';
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
    activityItems: savedActivityItems,
    fetchActivityItems,
    sendNewPaymentTransaction,
    updateActivityItemFromChannel,
  } = useActivityStore(activityActivityPageSelector);
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
  const [activityItems, setActivityItems] = useState();
  const isInverse = (activityItems?.results || []).length || activityLoading;

  useAuthChannel((event, data) => {
    if (event === txType.newPayment) {
      updateActivityItemFromChannel(data);
      fetchBalance(wallet);
    }
  });

  useEffect(() => {
    if (!enabled) return;

    fetchBalance(wallet);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  useEffect(() => {
    if (!savedActivity) {
      router.push(Routes.HOME);
      return;
    }

    const toUser = savedActivity.toUser;
    setUsername(toUser.username);
    setWalletAddress(toUser.walletAddress);
    fetchActivityItems({
      userId: user.id,
      accessToken: accessToken.token,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedActivity]);

  useEffect(() => {
    setActivityItems(savedActivityItems);
  }, [savedActivityItems]);

  const onPayHandler = () => {
    logEvent(EVENTS.OPEN_PAY);
  };

  const onSendHandler = () => {
    logEvent(EVENTS.SEND_PAY);
  };

  const onConfirmHandler = async (data) => {
    setPayError('');

    try {
      const userOps = await signNewPaymentUserOps(
        wallet,
        user.username,
        data.password,
        data.amount,
        data.toWalletAddress,
        {
          userId: user.id,
          accessToken: accessToken.token,
        },
      );
      await sendNewPaymentTransaction(userOps, data.message, {
        userId: user.id,
        accessToken: accessToken.token,
      });
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
    return (activityItems?.results || []).map((item, i) => {
      return (
        <NewPaymentCard
          key={`new-payment-card-${i}`}
          isFirst={i === 0}
          isReceiving={item.isReceiving}
          toUsername={item.toUser.username}
          fromUsername={item.fromUser.username}
          amount={displayUSDC(item.value)}
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
