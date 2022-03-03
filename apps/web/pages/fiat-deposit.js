import { useEffect } from 'react';
import { Image, VStack, HStack, Box, Text, Progress, useToast } from '@chakra-ui/react';
import { AppContainer, Head } from '../src/components';
import {
  useAccountStore,
  accountFiatetDepositPageSelector,
  useFiatStore,
  fiatFiatDepositPageSelector,
} from '../src/state';
import { EVENTS, logEvent } from '../src/utils/analytics';

export default function FiatDeposit() {
  const toast = useToast();
  const { enabled, user, accessToken } = useAccountStore(accountFiatetDepositPageSelector);
  const { fetchFiatDepositSession } = useFiatStore(fiatFiatDepositPageSelector);

  useEffect(() => {
    if (!enabled) return;

    (async () => {
      try {
        const sessionUrl = await fetchFiatDepositSession({
          userId: user.id,
          accessToken: accessToken.token,
        });
        logEvent(EVENTS.FIAT_REDIRECT_TO_WYRE_CHECKOUT);
        setTimeout(() => {
          location.href = sessionUrl;
        }, 1000);
      } catch (error) {
        toast({
          title: 'Deposit error',
          description:
            error.response?.data?.message || error.message || 'Unknown error, try again later!',
          status: 'error',
          position: 'top-right',
          duration: 5000,
          isClosable: true,
          onCloseComplete: close,
        });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return (
    <>
      <Head title="Stackup | Redirecting..." />

      <AppContainer>
        <VStack spacing="32px" w="100%" mt="128px">
          <Image src="./logotype-blue-navy.png" maxW="256px" alt="stackup logo" />

          <Box w="100%">
            <HStack mb="16px" justifyContent="center">
              <Text fontSize="lg" fontWeight={500}>
                Redirecting to
              </Text>

              <Image src="./wyre-logo.svg" maxW="64px" alt="wyre" />
            </HStack>

            <Progress isIndeterminate borderRadius="lg" />
          </Box>
        </VStack>
      </AppContainer>
    </>
  );
}
