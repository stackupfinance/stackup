import { useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Head,
  PageContainer,
  NavigationHeader,
  AppContainer,
  RecoverAccount,
} from '../../src/components';
import { useRecoverStore, recoverRecoverConfirmPageSelector } from '../../src/state';
import { Routes } from '../../src/config';
import { logEvent, EVENTS } from '../../src/utils/analytics';

function RecoverConfirm() {
  const router = useRouter();
  const { loading: recoverLoading, guardianRecoveryArray } = useRecoverStore(
    recoverRecoverConfirmPageSelector,
  );

  useEffect(() => {
    router.prefetch(Routes.RECOVER_NOT_POSSIBLE);
    router.prefetch(Routes.RECOVER_NEW_PASSWORD);
  }, [router]);

  useEffect(() => {
    if (!guardianRecoveryArray?.length) {
      router.push(Routes.RECOVER_LOOKUP);
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guardianRecoveryArray]);

  const onConfirmTrasaction = async (data) => {
    const account = await lookup(data);
    logEvent(EVENTS.RECOVER_ACCOUNT_LOOKUP);

    const { guardians } = account;
    if (guardians.length === 0) {
      logEvent(EVENTS.RECOVER_ACCOUNT_NOT_POSSIBLE);
      router.push(Routes.RECOVER_NOT_POSSIBLE);
    } else {
      router.push(Routes.RECOVER_NEW_PASSWORD);
    }
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
