import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Head,
  PageContainer,
  NavigationHeader,
  AppContainer,
  VerifyEmail,
} from '../../src/components';
import { useRecoverStore, recoverRecoverVerifyEmailPageSelector } from '../../src/state';
import { Routes } from '../../src/config';
import { logEvent, EVENTS } from '../../src/utils/analytics';

function RecoverVerifyEmail() {
  const router = useRouter();
  const {
    loading: recoverLoading,
    userOps,
    guardians,
    sendVerificationEmail,
    verifyEmail,
  } = useRecoverStore(recoverRecoverVerifyEmailPageSelector);
  const [isDisabled, setIsDisabled] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    router.prefetch(Routes.RECOVER_LOOKUP);
    router.prefetch(Routes.RECOVER_CONFIRM);
    router.prefetch(Routes.RECOVER_STATUS);
  }, [router]);

  useEffect(() => {
    if (!guardians.length) {
      router.push(Routes.RECOVER_LOOKUP);
      return;
    }
    if (!userOps) {
      router.push(Routes.RECOVER_NEW_PASSWORD);
      return;
    }

    onSendCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userOps]);

  const onSendCode = async () => {
    setError('');

    try {
      await sendVerificationEmail();
      logEvent(EVENTS.RECOVER_ACCOUNT_SEND_CODE);
      setIsDisabled(true);
      setTimeout(() => {
        setIsDisabled(false);
      }, 10000);
    } catch (error) {
      setError(error.response?.data?.message || 'Unknown error, try again later!');
    }
  };

  const onComplete = async (code) => {
    setError('');

    try {
      await verifyEmail(code);
      logEvent(EVENTS.RECOVER_ACCOUNT_VERIFY_EMAIL);

      if (guardians.length > 1) {
        router.push(Routes.RECOVER_STATUS);
      } else {
        router.push(Routes.RECOVER_CONFIRM);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Unknown error, try again later!');
    }
  };

  return (
    <>
      <Head title="Stackup | Recover Account" />

      <PageContainer>
        <NavigationHeader title="Verify E-mail" backLinkUrl={Routes.RECOVER_NEW_PASSWORD} />

        <AppContainer>
          <VerifyEmail
            isLoading={recoverLoading}
            isDisabled={isDisabled}
            onComplete={onComplete}
            onSendCode={onSendCode}
            error={error}
          />
        </AppContainer>
      </PageContainer>
    </>
  );
}

export default RecoverVerifyEmail;
