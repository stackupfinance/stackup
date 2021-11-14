import NextLink from 'next/link';
import { Image, VStack, Box, Input, Button, Divider } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { AppContainer, Head, Header } from '../components';
import { Routes } from '../src/config';

export default function Login() {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => {
    console.log(data);
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
              <form onSubmit={handleSubmit(onSubmit)}>
                <VStack spacing="16px">
                  <Input placeholder="Username" {...register('username')} />
                  <Input placeholder="Password" type="password" {...register('password')} />
                  <Button isFullWidth colorScheme="blue" size="lg" type="submit">
                    Log in
                  </Button>
                </VStack>
              </form>

              <Button isFullWidth mt="16px" variant="outline" size="lg">
                Recover account
              </Button>

              <Divider mt="16px" />

              <NextLink href={Routes.SIGN_UP} passHref>
                <Button isFullWidth as="a" mt="16px" variant="outline" size="lg">
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
