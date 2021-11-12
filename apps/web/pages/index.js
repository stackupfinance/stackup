import { Container, Center, Image, VStack, Box, Input, Button, Divider } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { Head, Header } from '../components';

export default function Login() {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <>
      <Head title="Stackup | Login" />

      <div style={{ minHeight: '100vh' }}>
        <Header backLinkLabel="Back to store" />

        <Container mt={['32px', '128px']} maxW="xl">
          <Center>
            <VStack spacing="32px" w="100%">
              <Image src="./mark_blue.png" maxW="128px" maxH="128px" alt="stackup logo" />

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

                <Button isFullWidth mt="16px" variant="outline" size="lg" type="submit">
                  Recover account
                </Button>

                <Divider mt="16px" />

                <Button isFullWidth mt="16px" variant="outline" size="lg" type="submit">
                  Create profile
                </Button>
              </Box>
            </VStack>
          </Center>
        </Container>
      </div>
    </>
  );
}
