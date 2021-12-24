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

function RecoverVerifyEmail() {
  const router = useRouter();
  const {
    loading: recoverLoading,
    newOwner,
    guardians,
    sendVerificationEmail,
    verifyEmail,
  } = useRecoverStore(recoverRecoverVerifyEmailPageSelector);
  const [isDisabled, setIsDisabled] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    router.prefetch(Routes.RECOVER_LOOKUP);
    router.prefetch(Routes.RECOVER_SUBMIT);
    router.prefetch(Routes.RECOVER_STATUS);
  }, [router]);

  useEffect(() => {
    if (!guardians.length) {
      router.push(Routes.RECOVER_LOOKUP);
      return;
    }
    if (!newOwner) {
      router.push(Routes.RECOVER_NEW_PASSWORD);
      return;
    }

    // onSendCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newOwner]);

  const onSendCode = async () => {
    setError('');

    try {
      await sendVerificationEmail();
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

      if (guardians.length > 1) {
        router.push(Routes.RECOVER_STATUS);
      } else {
        router.push(Routes.RECOVER_SUBMIT);
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
