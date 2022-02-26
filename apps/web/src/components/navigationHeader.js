import NextLink from 'next/link';
import { Box, HStack, Spacer, Heading, IconButton } from '@chakra-ui/react';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import { AppDrawer } from '.';

export const NavigationHeader = ({ title, backLinkUrl }) => {
  return (
    <header>
      <Box borderBottomWidth="1px" bg="gray.50">
        <HStack spacing={['8px', '16px']} py="16px" px="16px" maxW="xl" margin="0 auto">
          {backLinkUrl && (
            <NextLink href={backLinkUrl} passHref>
              <IconButton as="a" aria-label="Back button" icon={<ChevronLeftIcon />} />
            </NextLink>
          )}

          {backLinkUrl && <Spacer />}

          <Heading size="md">{title}</Heading>

          <Spacer />

          <AppDrawer />
        </HStack>
      </Box>
    </header>
  );
};
