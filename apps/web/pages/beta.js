import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Image,
  VStack,
  HStack,
  Box,
  Button,
  PinInput,
  PinInputField,
  Text,
  Link,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { PageContainer, AppContainer, Head, Header, InlineError } from '../src/components';
import { useInviteStore, inviteBetaPageSelector } from '../src/state';
import { Routes } from '../src/config';
import { EVENTS, logEvent } from '../src/utils/analytics';

export default function Beta() {
  const router = useRouter();
  const { loading, fetchInvite } = useInviteStore(inviteBetaPageSelector);
  const [inviteError, setInviteError] = useState('');

  const renderError = () => {
    if (inviteError) {
      return <InlineError message={inviteError} />;
    }

    return null;
  };

  const onComplete = async (inviteCode) => {
    try {
      await fetchInvite(inviteCode);
      logEvent(EVENTS.SIGN_UP_ENTER_INVITE_CODE);
      router.push(Routes.SIGN_UP);
    } catch (error) {
      setInviteError(
        error.response?.data?.message || error.message || 'Unknown error, try again later!',
      );
    }
  };

  return (
    <>
      <Head title="Stackup | Beta" />
      <PageContainer>
        <Header backLinkUrl={Routes.LOGIN} backLinkLabel="Login" />

        <AppContainer>
          <VStack spacing="32px" w="100%">
            <Image src="./mark-blue.png" maxW="128px" maxH="128px" alt="stackup logo" />

            <Box w="100%">
              <Text size="sm" mb="8px" w="100%" fontWeight={500}>
                Enter your six digit invite code to continue 🔑
              </Text>

              <Box borderWidth="1px" borderRadius="lg" p="16px" w="100%">
                <HStack mb="16px" justifyContent="center">
                  <PinInput
                    id="pin-input-1"
                    size="lg"
                    onComplete={onComplete}
                    onChange={() => setInviteError('')}
                  >
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                  </PinInput>
                </HStack>

                <Button
                  as={Link}
                  _hover={{ textDecoration: 'none' }}
                  isFullWidth
                  isExternal
                  href="https://stackup.sh"
                  isLoading={loading}
                  colorScheme="blue"
                  variant="outline"
                  rightIcon={<ExternalLinkIcon />}
                >
                  Join the waitlist
                </Button>

                {renderError()}
              </Box>
            </Box>
          </VStack>
        </AppContainer>
      </PageContainer>
    </>
  );
}
