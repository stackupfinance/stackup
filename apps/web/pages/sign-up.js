import { useState } from 'react';
import { useRouter } from 'next/router';
import { Image, VStack, Box, Input, Button } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { PageContainer, AppContainer, Head, Header, InlineError } from '../components';
import { useAccountStore, accountSignUpPageSelector } from '../src/state';
import { Routes } from '../src/config';

export default function SignUp() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const account = useAccountStore(accountSignUpPageSelector);
  const [registerError, setRegisterError] = useState('');

  const onSubmit = async (data) => {
    setRegisterError('');
    const { username, password } = data;

    try {
      await account.register({ username, password });
      router.push(Routes.WELCOME);
    } catch (error) {
      setRegisterError(error.response?.data?.message || 'Unknown error, try again later!');
    }
  };

  const renderError = () => {
    if (errors.username) {
      return <InlineError message="Username is required" />;
    }
    if (errors.password) {
      return <InlineError message="Password is required" />;
    }
    if (errors.confirmPassword?.type === 'required') {
      return <InlineError message="Confirm password is required" />;
    }
    if (errors.confirmPassword?.type === 'validate') {
      return <InlineError message="Password does not match" />;
    }
    if (registerError) {
      return <InlineError message={registerError} />;
    }
    return null;
  };

  return (
    <>
      <Head title="Stackup | Sign up" />

      <PageContainer>
        <Header backLinkUrl={Routes.LOGIN} backLinkLabel="Login" />

        <AppContainer>
          <VStack spacing="32px" w="100%">
            <Image src="./user-blue.png" maxW="128px" maxH="128px" alt="stackup logo" />

            <Box borderWidth="1px" borderRadius="lg" p="16px" w="100%">
              <form onSubmit={handleSubmit(onSubmit)} onChange={() => setRegisterError('')}>
                <VStack spacing="16px">
                  <Input
                    placeholder="Username"
                    isInvalid={errors.username}
                    {...register('username', { required: true })}
                  />
                  <Input
                    placeholder="Password"
                    type="password"
                    isInvalid={errors.password}
                    {...register('password', { required: true })}
                  />
                  <Input
                    placeholder="Confirm password"
                    type="password"
                    isInvalid={errors.confirmPassword}
                    {...register('confirmPassword', {
                      required: true,
                      validate: (value) => value === watch('password'),
                    })}
                  />
                  <Button
                    isFullWidth
                    isLoading={account.loading}
                    colorScheme="blue"
                    size="lg"
                    type="submit"
                  >
                    Next
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
