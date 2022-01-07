import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Head,
  PageContainer,
  NavigationHeader,
  AppContainer,
  GuardianStatus,
} from '../../src/components';
import { useRecoverStore, recoverRecoverStatusPageSelector } from '../../src/state';
import { useRecoverAccountChannel } from '../../src/hooks';
import { logEvent, EVENTS } from '../../src/utils/analytics';

import { Routes } from '../../src/config';

function RecoverStatus() {
  const router = useRouter();
  const {
    loading: recoverLoading,
    // userOperations, // TODO: append incoming signatures to this op
    status,
    channelId,
  } = useRecoverStore(recoverRecoverStatusPageSelector);
  const [debounce, setDebounce] = useState(true);

  useRecoverAccountChannel(channelId, (data) => {
    console.log(data);
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

  return (
    <>
      <Head title="Stackup | Recover Account" />

      <PageContainer>
        <NavigationHeader title="Guardian status" backLinkUrl={Routes.RECOVER_NEW_PASSWORD} />

        <AppContainer>
          <GuardianStatus isLoading={recoverLoading} isNextDisabled={true} status={status} />
        </AppContainer>
      </PageContainer>
    </>
  );
}

export default RecoverStatus;
