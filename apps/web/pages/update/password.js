import { useRouter } from 'next/router';
import { useToast } from '@chakra-ui/react';
import {
  Head,
  PageContainer,
  NavigationHeader,
  AppContainer,
  UpdatePassword as ChangePassword,
} from '../../src/components';
import { useAccountStore, accountUpdatePasswordPageSelector } from '../../src/state';
import { Routes } from '../../src/config';
import { logEvent, EVENTS } from '../../src/utils/analytics';

function UpdatePassword() {
  const router = useRouter();
  const toast = useToast();
  const {
    enabled,
    loading: accountLoading,
    updatePassword,
  } = useAccountStore(accountUpdatePasswordPageSelector);

  const onConfirm = async (data) => {
    if (!enabled) return;

    await updatePassword(data);
    toast({
      title: 'Password updated.',
      status: 'success',
      position: 'top-right',
      duration: 5000,
      isClosable: true,
    });
    logEvent(EVENTS.UPDATE_PASSWORD);
    router.push(Routes.HOME);
  };

  return (
    <>
      <Head title="Stackup | Account" />

      <PageContainer>
        <NavigationHeader title="Update password" backLinkUrl={Routes.HOME} />

        <AppContainer>
          <ChangePassword isLoading={accountLoading} onConfirm={onConfirm} />
        </AppContainer>
      </PageContainer>
    </>
  );
}

export default UpdatePassword;
