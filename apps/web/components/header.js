import NextLink from 'next/link';
import {
  Button,
  Box,
  HStack,
  Image,
  Spacer,
  useBreakpointValue,
  Heading,
  LinkBox,
  LinkOverlay,
} from '@chakra-ui/react';
import { ChevronLeftIcon } from '@chakra-ui/icons';

export const Header = ({ backLinkUrl }) => {
  const buttonSize = useBreakpointValue({ base: 'md', sm: 'lg' });

  return (
    <header>
      <Box borderBottomWidth="1px">
        <HStack spacing={['8px', '16px']} py="16px" px="16px" maxW="xl" margin="0 auto">
          {backLinkUrl && (
            <NextLink href={backLinkUrl} passHref>
              <Button as="a" variant="link" size={buttonSize} leftIcon={<ChevronLeftIcon />} />
            </NextLink>
          )}

          {backLinkUrl && <Spacer />}

          <LinkBox>
            <HStack spacing="8px">
              <Image src="./logo-light.png" maxW="32px" maxH="32px" alt="stackup logo" />
              <Heading as="h3" size="lg">
                <LinkOverlay href="https://stackup.sh/" target="_blank">
                  Stackup
                </LinkOverlay>
              </Heading>
            </HStack>
          </LinkBox>
        </HStack>
      </Box>
    </header>
  );
};
