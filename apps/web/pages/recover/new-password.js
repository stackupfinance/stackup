import { useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Head,
  PageContainer,
  NavigationHeader,
  AppContainer,
  NewPassword,
} from '../../src/components';
import { useRecoverStore, recoverRecoverNewPasswordPageSelector } from '../../src/state';
import { App, Routes } from '../../src/config';
import { logEvent, EVENTS } from '../../src/utils/analytics';

function RecoverNewPassword() {
  const router = useRouter();
  const {
    loading: recoverLoading,
    user,
    guardians,
    createSignerAndUserOps,
  } = useRecoverStore(recoverRecoverNewPasswordPageSelector);

  useEffect(() => {
    router.prefetch(Routes.RECOVER_VERIFY_EMAIL);
    router.prefetch(Routes.RECOVER_STATUS);
  }, [router]);

  useEffect(() => {
    if (!user || !guardians.length) {
      router.push(Routes.RECOVER_LOOKUP);
      return;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const onNextHandler = async (data) => {
    logEvent(EVENTS.RECOVER_ACCOUNT_CREATE_NEW_PASSWORD);
    await createSignerAndUserOps(data.password);

    if (guardians.find((curr) => curr === App.web3.paymaster)) {
      router.push(Routes.RECOVER_VERIFY_EMAIL);
    } else {
      router.push(Routes.RECOVER_STATUS);
    }
  };

  return (
    <>
      <Head title="Stackup | Recover Account" />

      <PageContainer>
        <NavigationHeader title="New password" backLinkUrl={Routes.RECOVER_LOOKUP} />

        <AppContainer>
          <NewPassword isLoading={recoverLoading} onNext={onNextHandler} />
        </AppContainer>
      </PageContainer>
    </>
  );
}

export default RecoverNewPassword;
