import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Head, PageContainer, NavigationHeader, AppContainer, Lookup } from '../../src/components';
import { useRecoverStore, recoverRecoverLookupPageSelector } from '../../src/state';
import { Routes } from '../../src/config';
import { logEvent, EVENTS } from '../../src/utils/analytics';

function RecoverLookup() {
  const router = useRouter();
  const { loading: recoverLoading, lookup } = useRecoverStore(recoverRecoverLookupPageSelector);

  useEffect(() => {
    router.prefetch(Routes.RECOVER_NOT_POSSIBLE);
    router.prefetch(Routes.RECOVER_NEW_PASSWORD);
  }, [router]);

  const onNextHandler = async (data) => {
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
        <NavigationHeader title="Account lookup" backLinkUrl={Routes.LOGIN} />

        <AppContainer>
          <Lookup isLoading={recoverLoading} onNext={onNextHandler} />
        </AppContainer>
      </PageContainer>
    </>
  );
}

export default RecoverLookup;
