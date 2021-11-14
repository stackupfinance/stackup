import NextLink from 'next/link';
import { Image, VStack, Box, Button, Heading } from '@chakra-ui/react';
import { AppContainer, Head, Header } from '../components';
import { useAccountStore, accountWelcomePageSelector } from '../src/state';
import { Routes } from '../src/config';

export default function Welcome() {
  const { user } = useAccountStore(accountWelcomePageSelector);

  return (
    <>
      <Head title="Stackup | Welcome!" />

      <div style={{ minHeight: '100vh' }}>
        <Header />

        <AppContainer>
          <VStack spacing="32px" w="100%">
            <Image src="./user-blue.png" maxW="128px" maxH="128px" alt="stackup logo" />

            <Box p="16px" w="100%">
              <Heading
                suppressHydrationWarning
                textAlign="center"
              >{`Welcome, ${user?.username}! 🎉`}</Heading>

              <NextLink href={Routes.HOME} passHref>
                <Button isFullWidth as="a" colorScheme="blue" mt="64px" size="lg">
                  Enter Stackup
                </Button>
              </NextLink>
            </Box>
          </VStack>
        </AppContainer>
      </div>
    </>
  );
}
