import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Head,
  PageContainer,
  NavigationHeader,
  AppContainer,
  VerifyEmail,
} from '../../src/components';
import {
  useAccountStore,
  accountUpdateVerifyEmailPageSelector,
  useUpdateStore,
  updateUpdateVerifyEmailPageSelector,
} from '../../src/state';
import { Routes } from '../../src/config';
import { logEvent, EVENTS } from '../../src/utils/analytics';

function UpdateVerifyEmail() {
  const router = useRouter();
  const {
    enabled,
    loading: accountLoading,
    sendVerificationEmail,
    verifyEmail,
  } = useAccountStore(accountUpdateVerifyEmailPageSelector);
  const { email: savedEmail } = useUpdateStore(updateUpdateVerifyEmailPageSelector);
  const [email, setEmail] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    router.prefetch(Routes.UPDATE_CONFIRM_GUARDIANS);
  }, [router]);

  useEffect(() => {
    if (!enabled) return;

    if (!savedEmail) {
      router.push(Routes.UPDATE_ADD_EMAIL);
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
      logEvent(EVENTS.UPDATE_GUARDIANS_SEND_CODE);
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
      logEvent(EVENTS.UPDATE_GUARDIANS_VERIFY_EMAIL);
      router.push(Routes.UPDATE_CONFIRM_GUARDIANS);
    } catch (error) {
      setError(error.response?.data?.message || 'Unknown error, try again later!');
    }
  };

  return (
    <>
      <Head title="Stackup | Setup Recovery" />

      <PageContainer>
        <NavigationHeader title="Verify E-mail" backLinkUrl={Routes.UPDATE_ADD_EMAIL} />

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

export default UpdateVerifyEmail;
