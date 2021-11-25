import { useState } from 'react';
import NextLink from 'next/link';
import { Image, VStack, Box, Input, Button, Divider } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { PageContainer, AppContainer, Head, Header, InlineError } from '../src/components';
import { useAccountStore, accountLoginPageSelector } from '../src/state';
import { Routes } from '../src/config';
import { EVENTS, logEvent } from '../src/utils/analytics';

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { loading, login } = useAccountStore(accountLoginPageSelector);
  const [loginError, setLoginError] = useState('');

  const onSubmit = async (data) => {
    setLoginError('');

    try {
      await login(data);
      logEvent(EVENTS.LOGIN);
    } catch (error) {
      setLoginError(error.response?.data?.message || 'Unknown error, try again later!');
    }
  };

  const onCreateProfile = () => {
    logEvent(EVENTS.SIGN_UP_START);
  };

  const renderError = () => {
    if (errors.username) {
      return <InlineError message="Username is required" />;
    }
    if (errors.password) {
      return <InlineError message="Password is required" />;
    }
    if (loginError) {
      return <InlineError message={loginError} />;
    }
    return null;
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
                  <Input placeholder="Username" {...register('username', { required: true })} />
                  <Input
                    placeholder="Password"
                    type="password"
                    {...register('password', { required: true })}
                  />
                  <Button
                    isFullWidth
                    isLoading={loading}
                    colorScheme="blue"
                    size="lg"
                    type="submit"
                  >
                    Log in
                  </Button>
                </VStack>
              </form>

              {renderError()}

              <Button
                isDisabled
                isFullWidth
                isLoading={loading}
                mt="16px"
                variant="outline"
                size="lg"
              >
                Recover account
              </Button>

              <Divider mt="16px" />

              <NextLink href={Routes.SIGN_UP} passHref>
                <Button
                  isFullWidth
                  isLoading={loading}
                  as="a"
                  mt="16px"
                  variant="outline"
                  size="lg"
                  onClick={onCreateProfile}
                >
                  Create profile
                </Button>
              </NextLink>
            </Box>
          </VStack>
        </AppContainer>
      </PageContainer>
    </>
  );
}
