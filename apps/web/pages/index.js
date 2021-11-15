import { useState } from 'react';
import NextLink from 'next/link';
import { Image, VStack, Box, Input, Button, Divider } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { AppContainer, Head, Header, InlineError } from '../components';
import { useAccountStore, accountLoginPageSelector } from '../src/state';
import { Routes } from '../src/config';

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
      router.push(Routes.HOME);
    } catch (error) {
      setLoginError(error.response?.data?.message || 'Unknown error, try again later!');
    }
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

      <div style={{ minHeight: '100vh' }}>
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

              <Button isFullWidth isLoading={loading} mt="16px" variant="outline" size="lg">
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
                >
                  Create profile
                </Button>
              </NextLink>
            </Box>
          </VStack>
        </AppContainer>
      </div>
    </>
  );
}
