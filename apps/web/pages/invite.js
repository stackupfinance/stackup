/* eslint-disable unused-imports/no-unused-imports */
import { useState } from 'react';
import NextLink from 'next/link';
import { Image, VStack, Box, Input, Button } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { PageContainer, AppContainer, Head, Header, InlineError } from '../src/components';
import { Routes } from '../src/config';
import axios from 'axios';
import { App } from '../src/config';
import { useRouter } from 'next/router';

export default function Invite() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loginError, setLoginError] = useState('');
  const router = useRouter();

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
      const res = await axios.get(`${App.stackup.backendUrl}/v1/invite`, {
        params: { invite: data.invite },
      });
      if (res.status === 200) router.push('/sign-up');
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
                  />
                  <Button isFullWidth isLoading={false} colorScheme="blue" size="lg" type="submit">
                    Log in
                  </Button>
                </VStack>
              </form>
              {renderError()}
            </Box>
          </VStack>
        </AppContainer>
      </PageContainer>
    </>
  );
}
