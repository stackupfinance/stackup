import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { nanoid } from 'nanoid';
import { useToast, Text, Link } from '@chakra-ui/react';
import {
  Head,
  PageContainer,
  NavigationHeader,
  AppContainer,
  RecoverAccount,
} from '../../src/components';
import { useRecoverStore, recoverRecoverConfirmPageSelector } from '../../src/state';
import { useRecoverAccountChannel } from '../../src/hooks';
import { App, Routes } from '../../src/config';

const txStatus = {
  success: 'success',
  failed: 'failed',
};

function RecoverConfirm() {
  const router = useRouter();
  const toast = useToast();
  const {
    loading: recoverLoading,
    userOperations,
    confirm,
    onComplete,
  } = useRecoverStore(recoverRecoverConfirmPageSelector);
  const [channelId] = useState(nanoid(16));

  useRecoverAccountChannel(channelId, (data) => {
    toast({
      title:
        data.status === txStatus.success ? 'Account recovery success' : 'Account recovery fail',
      description:
        data.status === txStatus.success ? (
          'Redirecting to login in 5 seconds.'
        ) : (
          <Text>
            Recovery failed. See transaction details{' '}
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
      onCloseComplete:
        data.status === txStatus.success ? () => router.push(Routes.LOGIN) : undefined,
    });
    onComplete();
  });

  useEffect(() => {
    router.prefetch(Routes.RECOVER_NOT_POSSIBLE);
    router.prefetch(Routes.RECOVER_NEW_PASSWORD);
    router.prefetch(Routes.LOGIN);
  }, [router]);

  useEffect(() => {
    if (!userOperations) {
      router.push(Routes.RECOVER_LOOKUP);
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userOperations]);

  const onConfirmTrasaction = async (data) => {
    await confirm(channelId, data.password);
    toast({
      title: 'Recovery initiated',
      description: 'This might take a minute. Stay on this page for updates...',
      status: 'info',
      position: 'top-right',
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <>
      <Head title="Stackup | Recover Account" />

      <PageContainer>
        <NavigationHeader title="Submit recovery" backLinkUrl={Routes.RECOVER_LOOKUP} />

        <AppContainer>
          <RecoverAccount isLoading={recoverLoading} onConfirmTrasaction={onConfirmTrasaction} />
        </AppContainer>
      </PageContainer>
    </>
  );
}

export default RecoverConfirm;
