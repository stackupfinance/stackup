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
  useUpdateStore,
  updateUpdateAddEmailPageSelector,
  useAccountStore,
  accountUpdateAddEmailPageSelector,
} from '../../src/state';
import { Routes } from '../../src/config';
import { logEvent, EVENTS } from '../../src/utils/analytics';

function UpdateAddEmail() {
  const router = useRouter();
  const { guardianMap, setEmail } = useUpdateStore(updateUpdateAddEmailPageSelector);
  const {
    enabled,
    loading: accountLoading,
    patchUser,
  } = useAccountStore(accountUpdateAddEmailPageSelector);

  useEffect(() => {
    router.prefetch(Routes.UPDATE_VERIFY_EMAIL);
  }, [router]);

  useEffect(() => {
    if (!enabled) return;

    if (!guardianMap.defaultGuardian) {
      router.push(Routes.UPDATE_EDIT_GUARDIANS);
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const onNext = async (data) => {
    if (!enabled) return;

    try {
      await patchUser(data);
      setEmail(data.email);
      logEvent(EVENTS.UPDATE_GUARDIANS_ADD_EMAIL);
      router.push(Routes.UPDATE_VERIFY_EMAIL);
    } catch (error) {
      throw error;
    }
  };

  return (
    <>
      <Head title="Stackup | Setup Recovery" />

      <PageContainer>
        <NavigationHeader title="Add E-mail" backLinkUrl={Routes.UPDATE_EDIT_GUARDIANS} />

        <AppContainer>
          <AddEmail isLoading={accountLoading} onNext={onNext} />
        </AppContainer>
      </PageContainer>
    </>
  );
}

export default UpdateAddEmail;
