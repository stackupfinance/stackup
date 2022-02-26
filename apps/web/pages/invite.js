/* eslint-disable unused-imports/no-unused-imports */
import { useState } from 'react';
import NextLink from 'next/link';
import { Image, VStack, Box, Input, Button } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { PageContainer, AppContainer, Head, Header, InlineError } from '../src/components';
import { useRouter } from 'next/router';
import { useInviteStore, inviteSelector } from '../src/state';
import { Routes } from '../src/config';

export default function Invite() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loginError, setLoginError] = useState('');
  const router = useRouter();
  const { loading, invite, fetchInvite } = useInviteStore(inviteSelector);

  const renderError = () => {
    if (errors.invite) {
      return <InlineError message="Invite code is required" />;
    }
    if (loginError) {
      return <InlineError message={loginError} />;
    }
    return null;
  };

  const onSubmit = async (data) => {
    setLoginError('');
    try {
      await fetchInvite(data);
      if (invite) {
        router.push('/sign-up');
      }
    } catch (error) {
      setLoginError(
        error.response?.data?.message || error.message || 'Unknown error, try again later!',
      );
    }
  };

  return (
    <>
      <Head title="Stackup" />
      <PageContainer>
        <Header />
        <AppContainer>
          <VStack spacing="32px" w="100%">
            <Image src="./mark-blue.png" maxW="128px" maxH="128px" alt="stackup logo" />
            <Box borderWidth="1px" borderRadius="lg" p="16px" w="100%">
              <form onSubmit={handleSubmit(onSubmit)} onChange={() => setLoginError('')}>
                <VStack spacing="16px">
                  <Input
                    placeholder="Enter your unique Invite Code"
                    {...register('invite', { required: true })}
                    required
                  />
                  {renderError()}

                  <Button
                    isFullWidth
                    isLoading={loading}
                    mt="16px"
                    variant="outline"
                    size="lg"
                    type="submit"
                  >
                    Check your Invite Code
                  </Button>

                  <Button
                    isFullWidth
                    isDisabled={invite ? false : true}
                    as="a"
                    colorScheme="blue"
                    size="lg"
                    onClick={() => {
                      invite && router.push(Routes.SIGN_UP);
                    }}
                  >
                    Create profile
                  </Button>
                </VStack>
              </form>
            </Box>
          </VStack>
        </AppContainer>
      </PageContainer>
    </>
  );
}
