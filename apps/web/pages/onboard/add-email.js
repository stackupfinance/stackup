import { useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Head,
  PageContainer,
  NavigationHeader,
  AppContainer,
  AddEmail,
} from '../../src/components';
import {
  useOnboardStore,
  onboardOnboardAddEmailPageSelector,
  useAccountStore,
  accountOnboardAddEmailPageSelector,
} from '../../src/state';
import { Routes } from '../../src/config';
import { logEvent, EVENTS } from '../../src/utils/analytics';

function OnboardAddEmail() {
  const router = useRouter();
  const { guardianMap, setEmail } = useOnboardStore(onboardOnboardAddEmailPageSelector);
  const {
    enabled,
    loading: accountLoading,
    user,
    patchUser,
  } = useAccountStore(accountOnboardAddEmailPageSelector);

  useEffect(() => {
    router.prefetch(Routes.HOME);
    router.prefetch(Routes.ONBOARD_RECOVERY);
    router.prefetch(Routes.ONBOARD_VERIFY_EMAIL);
  }, [router]);

  useEffect(() => {
    if (!enabled) return;
    if (user.isOnboarded) {
      router.push(Routes.HOME);
      return;
    }
    if (!guardianMap.defaultGuardian) {
      router.push(Routes.ONBOARD_RECOVERY);
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const onNext = async (data) => {
    if (!enabled) return;

    try {
      await patchUser(data);
      setEmail(data.email);
      logEvent(EVENTS.ONBOARD_ADD_EMAIL);
      router.push(Routes.ONBOARD_VERIFY_EMAIL);
    } catch (error) {
      throw error;
    }
  };

  return (
    <>
      <Head title="Stackup | Setup Recovery" />

      <PageContainer>
        <NavigationHeader title="Add E-mail" backLinkUrl={Routes.ONBOARD_RECOVERY} />

        <AppContainer>
          <AddEmail isLoading={accountLoading} onNext={onNext} />
        </AppContainer>
      </PageContainer>
    </>
  );
}

export default OnboardAddEmail;
