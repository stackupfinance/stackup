import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useToast, Text, Link } from '@chakra-ui/react';
import { wallet as walletLib } from '@stackupfinance/contracts';
import {
  Head,
  PageContainer,
  NavigationHeader,
  AppContainer,
  ApproveRecovery,
} from '../../src/components';
import {
  useAccountStore,
  accountRecoverApproveRequestPageSelector,
  useRecoverStore,
  recoverRecoverApproveRequestPageSelector,
  useWalletStore,
  walletRecoverApproveRequestPageSelector,
  useNotificationStore,
  notificationRecoverApproveRequestPageSelector,
} from '../../src/state';
import { useAuthChannel } from '../../src/hooks';
import { App, Routes } from '../../src/config';
import { provider } from '../../src/utils/web3';
import { logEvent, EVENTS } from '../../src/utils/analytics';
import { types, txStatus } from '../../src/utils/events';

function RecoverApproveRequest() {
  const router = useRouter();
  const toast = useToast();
  const { enabled, user, wallet, accessToken } = useAccountStore(
    accountRecoverApproveRequestPageSelector,
  );
  const {
    loading: recoverLoading,
    savedGuardianRequest,
    approveGuardianRequest,
  } = useRecoverStore(recoverRecoverApproveRequestPageSelector);
  const { loading: walletLoading, setupWalletUserOps } = useWalletStore(
    walletRecoverApproveRequestPageSelector,
  );
  const { loading: notificationLoading, deleteNotification } = useNotificationStore(
    notificationRecoverApproveRequestPageSelector,
  );
  const [username, setUsername] = useState('');
  const [checkWallet, setCheckWallet] = useState(true);
  const [isWalletDeployed, setIsWalletDeployed] = useState(true);
  const [isTransactionLoading, setIsTransactionLoading] = useState(false);
  const [password, setPassword] = useState('');
  const passwordRef = useRef();
  passwordRef.current = password;

  const approveRequest = async (password) => {
    await approveGuardianRequest(wallet, password, {
      accessToken: accessToken.token,
    });
    logEvent(EVENTS.RECOVER_ACCOUNT_GUARDIAN_SIGN_OP);

    await deleteNotification(savedGuardianRequest.notificationId, {
      userId: user.id,
      accessToken: accessToken.token,
    });
    router.push(Routes.HOME);
  };

  useAuthChannel((event, data) => {
    if (event === types.genericRelay) {
      toast({
        title:
          data.status === txStatus.success
            ? 'Wallet activation success'
            : 'Account activation fail',
        description:
          data.status === txStatus.success ? (
            'Signing recovery request and redirecting back to home page.'
          ) : (
            <Text>
              Activation failed. See transaction details{' '}
              <Link
                fontWeight="bold"
                href={`${App.web3.explorer}/tx/${data.transactionHash}`}
                isExternal
              >
                here
              </Link>
              .
            </Text>
          ),
        status: data.status === txStatus.success ? 'success' : 'error',
        position: 'top-right',
        duration: 5000,
        isClosable: true,
      });

      if (data.status === txStatus.success) {
        setIsTransactionLoading(false);
        approveRequest(passwordRef.current);
      }
    }
  });

  useEffect(() => {
    if (!savedGuardianRequest) {
      router.push(Routes.HOME);
      return;
    }

    setUsername(savedGuardianRequest.username);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedGuardianRequest]);

  useEffect(() => {
    if (!enabled) return;

    (async () => {
      if (checkWallet) {
        setIsWalletDeployed(await walletLib.proxy.isCodeDeployed(provider, wallet.walletAddress));
        setCheckWallet(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const onConfirmRequest = async (data) => {
    if (!enabled) return;
    setPassword('');

    if (isWalletDeployed) {
      await approveRequest(data.password);
    } else {
      await setupWalletUserOps(wallet, data.password, {
        userId: user.id,
        accessToken: accessToken.token,
      });
      logEvent(EVENTS.RECOVER_ACCOUNT_GUARDIAN_DEPLOY_WALLET);
      setPassword(data.password);
      setIsTransactionLoading(true);
      toast({
        title: 'Account activation initiated',
        description: 'This might take a minute. Stay on this page for updates...',
        status: 'info',
        position: 'top-right',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <Head title="Stackup | Recover Account" />

      <PageContainer>
        <NavigationHeader title="Approve recovery" backLinkUrl={Routes.HOME} />

        <AppContainer>
          <ApproveRecovery
            isLoading={
              checkWallet ||
              isTransactionLoading ||
              recoverLoading ||
              walletLoading ||
              notificationLoading
            }
            isWalletDeployed={isWalletDeployed}
            username={username}
            onConfirmRequest={onConfirmRequest}
          />
        </AppContainer>
      </PageContainer>
    </>
  );
}

export default RecoverApproveRequest;
