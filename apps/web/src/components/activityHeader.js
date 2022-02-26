import NextLink from 'next/link';
import { Box, HStack, Heading, IconButton } from '@chakra-ui/react';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import { AppDrawer } from '.';

export const ActivityHeader = ({ backLinkUrl, username }) => {
  return (
    <header>
      <Box borderBottomWidth="1px" bg="gray.50">
        <HStack spacing={['8px', '16px']} py="16px" px="16px" maxW="xl" margin="0 auto">
          <NextLink href={backLinkUrl} passHref>
            <IconButton as="a" icon={<ChevronLeftIcon />} />
          </NextLink>

          <Heading size="md" flex={1} textAlign="center">
            {username}
          </Heading>

          <AppDrawer />
        </HStack>
      </Box>
    </header>
  );
};
