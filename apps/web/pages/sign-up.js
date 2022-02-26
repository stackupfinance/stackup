/* eslint-disable unused-imports/no-unused-vars */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Image, VStack, Box, Input, Button } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import {
  PageContainer,
  AppContainer,
  Head,
  Header,
  InlineError,
  PasswordStrength,
} from '../src/components';
import {
  useAccountStore,
  accountSignUpPageSelector,
  useOnboardStore,
  onboardSignUpPageSelector,
  useInviteStore,
  inviteSelector,
} from '../src/state';
import { Routes } from '../src/config';
import { EVENTS, logEvent } from '../src/utils/analytics';

export default function SignUp() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const { loading, register: registerAccount } = useAccountStore(accountSignUpPageSelector);
  const { createEphemeralWallet } = useOnboardStore(onboardSignUpPageSelector);
  const [registerError, setRegisterError] = useState('');
  const { invite } = useInviteStore(inviteSelector);

  useEffect(() => {
    router.prefetch(Routes.WELCOME);
  }, [router]);

  const onSubmit = async (data) => {
    setRegisterError('');
    const { username, password } = data;

    try {
      // console.log(invite)
      if (invite) {
        await registerAccount({ username, password, invite });
        createEphemeralWallet(password);
        logEvent(EVENTS.SIGN_UP_FINISH);
        router.push(Routes.WELCOME);
      }
      setRegisterError('Invite code not found. Please use invite code to proceed.');
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
                <Input
                  mb="16px"
                  placeholder="Username"
                  isInvalid={errors.username}
                  {...register('username', { required: true })}
                />

                <Input
                  mb="4px"
                  placeholder="Create password"
                  type="password"
                  isInvalid={errors.password}
                  {...register('password', { required: true })}
                />
                <PasswordStrength password={watch('password')} />

                <Input
                  my="16px"
                  placeholder="Confirm password"
                  type="password"
                  isInvalid={errors.confirmPassword}
                  {...register('confirmPassword', {
                    required: true,
                    validate: (value) => value === watch('password'),
                  })}
                />
                <Button isFullWidth isLoading={loading} colorScheme="blue" size="lg" type="submit">
                  Next
                </Button>
              </form>

              {renderError()}
            </Box>
          </VStack>
        </AppContainer>
      </PageContainer>
    </>
  );
}
