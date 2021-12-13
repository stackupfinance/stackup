import { Box, HStack, Image, Spacer, LinkBox, LinkOverlay, Heading } from '@chakra-ui/react';

export const OnboardHeader = ({ title }) => {
  return (
    <header>
      <Box borderBottomWidth="1px">
        <HStack spacing={['8px', '16px']} py="16px" px="16px" maxW="xl" margin="0 auto">
          <Heading size="md">{title}</Heading>

          <Spacer />

          <LinkBox>
            <LinkOverlay href="https://stackup.sh/" target="_blank">
              <Image src="/mark-blue.png" maxW="32px" maxH="32px" alt="stackup logo" />
            </LinkOverlay>
          </LinkBox>
        </HStack>
      </Box>
    </header>
  );
};
