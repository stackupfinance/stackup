import { Image, VStack, Box, Input, Button } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { AppContainer, Head, Header } from '../components';
import { Routes } from '../src/config';

export default function SignUp() {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <>
      <Head title="Stackup | Sign up" />

      <div style={{ minHeight: '100vh' }}>
        <Header backLinkUrl={Routes.LOGIN} backLinkLabel="Login" />

        <AppContainer>
          <VStack spacing="32px" w="100%">
            <Image src="./user-blue.png" maxW="128px" maxH="128px" alt="stackup logo" />

            <Box borderWidth="1px" borderRadius="lg" p="16px" w="100%">
              <form onSubmit={handleSubmit(onSubmit)}>
                <VStack spacing="16px">
                  <Input placeholder="Username" {...register('username')} />
                  <Input placeholder="Password" type="password" {...register('password')} />
                  <Input
                    placeholder="Confirm password"
                    type="password"
                    {...register('confirmPassword')}
                  />
                  <Button isFullWidth colorScheme="blue" size="lg" type="submit">
                    Next
                  </Button>
                </VStack>
              </form>
            </Box>
          </VStack>
        </AppContainer>
      </div>
    </>
  );
}
