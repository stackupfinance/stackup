import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { wallet as walletLib } from '@stackupfinance/contracts';
import {
  Head,
  PageContainer,
  NavigationHeader,
  AppContainer,
  ConfirmGuardians,
} from '../../src/components';
import {
  useAccountStore,
  accountOnboardSummaryPageSelector,
  useOnboardStore,
  onboardOnboardSummaryPageSelector,
} from '../../src/state';
import { Routes } from '../../src/config';
import { logEvent, EVENTS } from '../../src/utils/analytics';

function OnboardSummary() {
  const router = useRouter();
  const {
    enabled,
    loading: accountLoading,
    user,
    wallet,
    saveEncryptedWallet,
  } = useAccountStore(accountOnboardSummaryPageSelector);
  const { ephemeralWallet, guardianMap: savedGuardianMap } = useOnboardStore(
    onboardOnboardSummaryPageSelector,
  );
  const [email, setEmail] = useState('');
  const [guardianMap, setGuardianMap] = useState('');

  useEffect(() => {
    router.prefetch(Routes.HOME);
    router.prefetch(Routes.ONBOARD_ADD_EMAIL);
  }, [router]);

  useEffect(() => {
    if (!enabled) return;
    if (wallet) {
      router.push(Routes.HOME);
      return;
    }
    if (savedGuardianMap.defaultGuardian && !user.isEmailVerified) {
      router.push(Routes.ONBOARD_ADD_EMAIL);
      return;
    }
    if (savedGuardianMap.defaultGuardian) {
      setEmail(user.email);
    }

    setGuardianMap(savedGuardianMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const onConfirmHandler = async (data) => {
    const ephemeralSigner = walletLib.proxy.decryptSigner(ephemeralWallet, data.password);
    if (!ephemeralSigner) {
      throw new Error('Incorrect password');
    }

    const { defaultGuardian, ...rest } = guardianMap;
    const otherGuardians = Object.values(rest);
    const guardians = guardianMap.defaultGuardian
      ? [defaultGuardian, ...otherGuardians]
      : otherGuardians;
    await saveEncryptedWallet(walletLib.proxy.initEncryptedIdentity(data.password, { guardians }));
    logEvent(EVENTS.ONBOARD_CONFIRM_SETUP);
    router.push(Routes.HOME);
  };

  return (
    <>
      <Head title="Stackup | Setup Recovery" />

      <PageContainer>
        <NavigationHeader title="Confirm Setup" backLinkUrl={Routes.ONBOARD_ADD_EMAIL} />

        <AppContainer>
          <ConfirmGuardians
            isLoading={accountLoading}
            onConfirm={onConfirmHandler}
            guardianMap={guardianMap}
            email={email}
          />
        </AppContainer>
      </PageContainer>
    </>
  );
}

export default OnboardSummary;
