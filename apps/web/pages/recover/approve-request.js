import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Head,
  PageContainer,
  NavigationHeader,
  AppContainer,
  ApproveRecovery,
} from '../../src/components';
import {
  useAccountStore,
  accountRecoverApproveRequestPageSelector,
  useRecoverStore,
  recoverRecoverApproveRequestPageSelector,
} from '../../src/state';
import { Routes } from '../../src/config';
import { logEvent, EVENTS } from '../../src/utils/analytics';

function RecoverApproveRequest() {
  const router = useRouter();
  const { enabled, wallet, accessToken } = useAccountStore(
    accountRecoverApproveRequestPageSelector,
  );
  const {
    loading: recoverLoading,
    savedGuardianRequest,
    approveGuardianRequest,
  } = useRecoverStore(recoverRecoverApproveRequestPageSelector);
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (!savedGuardianRequest) {
      router.push(Routes.HOME);
      return;
    }

    setUsername(savedGuardianRequest.username);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedGuardianRequest]);

  const onConfirmRequest = async (data) => {
    if (!enabled) return;

    await approveGuardianRequest(wallet, data.password, {
      accessToken: accessToken.token,
    });
    logEvent(EVENTS.RECOVER_ACCOUNT_SIGN_AS_GUARDIAN);
  };

  return (
    <>
      <Head title="Stackup | Recover Account" />

      <PageContainer>
        <NavigationHeader title="Approve recovery" backLinkUrl={Routes.HOME} />

        <AppContainer>
          <ApproveRecovery
            isLoading={recoverLoading}
            username={username}
            onConfirmRequest={onConfirmRequest}
          />
        </AppContainer>
      </PageContainer>
    </>
  );
}

export default RecoverApproveRequest;
