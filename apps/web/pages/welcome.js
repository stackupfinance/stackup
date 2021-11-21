import { useEffect, useState } from 'react';
import NextLink from 'next/link';
import { Image, VStack, Box, Button, Heading } from '@chakra-ui/react';
import { PageContainer, AppContainer, Head, Header } from '../src/components';
import { useAccountStore, accountWelcomePageSelector } from '../src/state';
import { Routes } from '../src/config';

export default function Welcome() {
  const { user } = useAccountStore(accountWelcomePageSelector);
  const [username, setUsername] = useState('');

  useEffect(() => {
    user && setUsername(user.username);
  }, [user]);

  return (
    <>
      <Head title="Stackup | Welcome!" />

      <PageContainer>
        <Header />

        <AppContainer>
          <VStack spacing="32px" w="100%">
            <Image src="./user-blue.png" maxW="128px" maxH="128px" alt="stackup logo" />

            <Box p="16px" w="100%">
              <Heading textAlign="center">{`Welcome, ${username}! 🎉`}</Heading>

              <NextLink href={Routes.HOME} passHref>
                <Button isFullWidth as="a" colorScheme="blue" mt="64px" size="lg">
                  Enter Stackup
                </Button>
              </NextLink>
            </Box>
          </VStack>
        </AppContainer>
      </PageContainer>
    </>
  );
}
