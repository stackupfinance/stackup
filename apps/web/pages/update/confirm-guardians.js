import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useToast, Text, Link } from '@chakra-ui/react';
import {
  Head,
  PageContainer,
  NavigationHeader,
  AppContainer,
  ConfirmGuardians,
} from '../../src/components';
import {
  useAccountStore,
  accountUpdateConfirmGuardiansPageSelector,
  useUpdateStore,
  updateUpdateConfirmGuardiansPageSelector,
  useWalletStore,
  walletUpdateConfirmGuardiansPageSelector,
} from '../../src/state';
import { App, Routes } from '../../src/config';
import { useAuthChannel } from '../../src/hooks';
import { txType, txStatus } from '../../src/utils/transaction';
import { logEvent, EVENTS } from '../../src/utils/analytics';

function UpdateConfirmGuardians() {
  const router = useRouter();
  const toast = useToast();
  const {
    enabled,
    loading: accountLoading,
    user,
    wallet,
    accessToken,
    getUser,
    patchUser,
  } = useAccountStore(accountUpdateConfirmGuardiansPageSelector);
  const {
    loading: updateLoading,
    guardianMap: savedGuardianMap,
    currentGuardians,
  } = useUpdateStore(updateUpdateConfirmGuardiansPageSelector);
  const { loading: walletLoading, updateGuardianOps } = useWalletStore(
    walletUpdateConfirmGuardiansPageSelector,
  );
  const [isTransactionLoading, setIsTransactionLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [guardianMap, setGuardianMap] = useState({});
  const guardianMapRef = useRef();
  guardianMapRef.current = guardianMap;

  useAuthChannel(async (event, data) => {
    if (event === txType.genericRelay) {
      toast({
        title:
          data.status === txStatus.success ? 'Guardian update success' : 'Guardian update fail',
        description:
          data.status === txStatus.failed ? (
            <Text>
              Guardian update failed. See transaction details{' '}
              <Link
                fontWeight="bold"
                href={`${App.web3.explorer}/tx/${data.transactionHash}`}
                isExternal
              >
                here
              </Link>
              .
            </Text>
          ) : undefined,
        status: data.status === txStatus.success ? 'success' : 'error',
        position: 'top-right',
        duration: 5000,
        isClosable: true,
      });

      setIsTransactionLoading(false);
      if (data.status === txStatus.success) {
        if (!guardianMapRef.current.defaultGuardian) {
          await patchUser({ unset: ['email'] });
          await getUser();
        }

        logEvent(EVENTS.UPDATE_GUARDIANS_CONFIRM);
        router.push(Routes.UPDATE_EDIT_GUARDIANS);
      }
    }
  });

  useEffect(() => {
    if (!enabled) return;

    if (!savedGuardianMap) {
      router.push(Routes.UPDATE_EDIT_GUARDIANS);
      return;
    }
    if (savedGuardianMap.defaultGuardian) {
      setEmail(user.email);
    }

    setGuardianMap(savedGuardianMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const onConfirm = async (data) => {
    if (!enabled) return;

    await updateGuardianOps(currentGuardians, Object.values(guardianMap), wallet, data.password, {
      userId: user.id,
      accessToken: accessToken.token,
    });
    setIsTransactionLoading(true);
    toast({
      title: 'Update guardians initiated',
      description: 'This might take a minute. Stay on this page for updates...',
      status: 'info',
      position: 'top-right',
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <>
      <Head title="Stackup | Account" />

      <PageContainer>
        <NavigationHeader title="Confirm guardians" backLinkUrl={Routes.UPDATE_EDIT_GUARDIANS} />

        <AppContainer>
          <ConfirmGuardians
            isLoading={accountLoading || updateLoading || walletLoading || isTransactionLoading}
            guardianMap={guardianMap}
            email={email}
            onConfirm={onConfirm}
          />
        </AppContainer>
      </PageContainer>
    </>
  );
}

export default UpdateConfirmGuardians;
