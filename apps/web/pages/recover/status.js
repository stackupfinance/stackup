import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useToast } from '@chakra-ui/react';
import {
  Head,
  PageContainer,
  NavigationHeader,
  AppContainer,
  GuardianStatus,
} from '../../src/components';
import { useRecoverStore, recoverRecoverStatusPageSelector } from '../../src/state';
import { useRecoverAccountChannel } from '../../src/hooks';
import { signatureCount } from '../../src/utils/web3';
import { logEvent, EVENTS } from '../../src/utils/analytics';
import { Routes } from '../../src/config';

function RecoverStatus() {
  const router = useRouter();
  const toast = useToast();
  const {
    loading: recoverLoading,
    userOperations,
    guardians,
    status,
    channelId,
    updateStatus,
  } = useRecoverStore(recoverRecoverStatusPageSelector);
  const [debounce, setDebounce] = useState(true);
  const [isNextDisabled, setIsNextDisabled] = useState(true);

  useRecoverAccountChannel(channelId, (data) => {
    toast({
      title: `${data.username} approved your recovery`,
      status: 'success',
      position: 'top-right',
      duration: 5000,
      isClosable: true,
    });
    updateStatus(data);
  });

  useEffect(() => {
    router.prefetch(Routes.RECOVER_CONFIRM);
  }, [router]);

  useEffect(() => {
    if (!status) {
      router.push(Routes.RECOVER_NEW_PASSWORD);
      return;
    }

    if (debounce) {
      logEvent(EVENTS.RECOVER_ACCOUNT_NOTIFY_GUARDIANS);
      setDebounce(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    if (signatureCount(userOperations[0]) >= Math.ceil(guardians.length / 2)) {
      setIsNextDisabled(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userOperations]);

  const onNextClick = () => {
    router.push(Routes.RECOVER_CONFIRM);
  };

  return (
    <>
      <Head title="Stackup | Recover Account" />

      <PageContainer>
        <NavigationHeader title="Guardian status" backLinkUrl={Routes.RECOVER_NEW_PASSWORD} />

        <AppContainer>
          <GuardianStatus
            isLoading={recoverLoading}
            isNextDisabled={isNextDisabled}
            status={status}
            onNextClick={onNextClick}
          />
        </AppContainer>
      </PageContainer>
    </>
  );
}

export default RecoverStatus;
