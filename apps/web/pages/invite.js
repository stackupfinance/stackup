/* eslint-disable unused-imports/no-unused-imports */
import { useState } from 'react';
import NextLink from 'next/link';
import { Image, VStack, Box, Input, Button } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import {
  PageContainer,
  AppContainer,
  Head,
  Header,
  InlineError,
  InlineSuccess,
} from '../src/components';
import { useRouter } from 'next/router';
import { useInviteStore, inviteSelector } from '../src/state';

export default function Invite() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');

  const router = useRouter();
  const { loading, invite, used, fetchInvite } = useInviteStore(inviteSelector);

  const renderError = () => {
    if (errors.invite) {
      return setTimeout(() => {
        <InlineError message="Invite code is required" />;
      }, 3000);
    }
    if (loginError) {
      return <InlineError message={loginError} />;
    }
    return null;
  };

  const renderSuccess = () => {
    if (loginSuccess) {
      return <InlineSuccess message={loginSuccess} />;
    }
  };

  const onSubmit = async (data) => {
    try {
      await fetchInvite(data);
      if (invite && !used) {
        setLoginSuccess('That looks good!');
      }
      setTimeout(() => {
        setLoginSuccess('');
      }, 3000);
    } catch (error) {
      setLoginError(
        error.response?.data?.message || error.message || 'Unknown error, try again later!',
      );
      setTimeout(() => {
        setLoginError('');
      }, 3000);
    }
  };

  const pushToSignup = () => {
    if (invite && !used) {
      router.push('/sign-up');
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
                  {renderSuccess()}
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
                    isDisabled={used ? true : used === undefined ? true : false}
                    as="a"
                    colorScheme="blue"
                    size="lg"
                    onClick={pushToSignup}
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
