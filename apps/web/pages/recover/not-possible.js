import NextLink from 'next/link';
import { Image, VStack, Button, Heading } from '@chakra-ui/react';
import { PageContainer, AppContainer, NavigationHeader } from '../../src/components';
import { Routes } from '../../src/config';

export default function RecoverNotPossible() {
  return (
    <>
      <PageContainer>
        <NavigationHeader title="Cannot recover" backLinkUrl={Routes.RECOVER_LOOKUP} />

        <AppContainer>
          <VStack spacing="32px" w="100%">
            <Image src="/user-blue.png" maxW="128px" maxH="128px" alt="stackup logo" />

            <Heading
              as="h3"
              size="lg"
              textAlign="center"
            >{`This account has no guardians to initiate a recovery 🔒`}</Heading>

            <VStack spacing="16px" w="100%">
              <NextLink href={Routes.LOGIN} passHref>
                <Button isFullWidth as="a" colorScheme="blue" size="lg">
                  Login
                </Button>
              </NextLink>

              <NextLink href={Routes.SIGN_UP} passHref>
                <Button isFullWidth as="a" variant="outline" size="lg">
                  Create a profile
                </Button>
              </NextLink>
            </VStack>
          </VStack>
        </AppContainer>
      </PageContainer>
    </>
  );
}
