import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Head,
  PageContainer,
  OnboardHeader,
  AppContainer,
  VerifyEmail,
} from '../../src/components';
import {
  useAccountStore,
  accountOnboardVerifyEmailPageSelector,
  useOnboardStore,
  onboardOnboardVerifyEmailPageSelector,
} from '../../src/state';
import { Routes } from '../../src/config';

function OnboardVerifyEmail() {
  const router = useRouter();
  const {
    enabled,
    loading: accountLoading,
    wallet,
    sendVerificationEmail,
    verifyEmail,
  } = useAccountStore(accountOnboardVerifyEmailPageSelector);
  const { email: savedEmail } = useOnboardStore(onboardOnboardVerifyEmailPageSelector);
  const [email, setEmail] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    router.prefetch(Routes.HOME);
    router.prefetch(Routes.ONBOARD_ADD_EMAIL);
    router.prefetch(Routes.ONBOARD_SUMMARY);
  }, [router]);

  useEffect(() => {
    if (!enabled) return;
    if (wallet) {
      router.push(Routes.HOME);
      return;
    }
    if (!savedEmail) {
      router.push(Routes.ONBOARD_ADD_EMAIL);
      return;
    }

    onSendCode();
    setEmail(savedEmail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

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
      router.push(Routes.ONBOARD_SUMMARY);
    } catch (error) {
      setError(error.response?.data?.message || 'Unknown error, try again later!');
    }
  };

  return (
    <>
      <Head title="Stackup | Setup Recovery" />

      <PageContainer>
        <OnboardHeader title="Verify E-mail" backLinkUrl={Routes.ONBOARD_ADD_EMAIL} />

        <AppContainer>
          <VerifyEmail
            isLoading={accountLoading}
            isDisabled={isDisabled}
            email={email}
            onComplete={onComplete}
            onSendCode={onSendCode}
            error={error}
          />
        </AppContainer>
      </PageContainer>
    </>
  );
}

export default OnboardVerifyEmail;
