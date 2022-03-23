import { HStack, Alert, AlertIcon, AlertTitle, AlertDescription, Link } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';

export const AlphaBanner = () => {
  return (
    <Alert status="info" justifyContent="center">
      <HStack spacing="0px" w="xl" px={[undefined, '16px']}>
        <AlertIcon />

        <HStack spacing="0px">
          <AlertTitle fontSize={['sm', 'md']}>This is an alpha release.</AlertTitle>

          <AlertDescription fontSize={['sm', 'md']}>
            <Link isExternal href="https://stackup.sh/disclaimer">
              See disclaimer <ExternalLinkIcon />
            </Link>
          </AlertDescription>
        </HStack>
      </HStack>
    </Alert>
  );
};
