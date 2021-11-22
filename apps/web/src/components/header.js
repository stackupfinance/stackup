import NextLink from 'next/link';
import {
  Button,
  Box,
  HStack,
  Image,
  Spacer,
  useBreakpointValue,
  LinkBox,
  LinkOverlay,
} from '@chakra-ui/react';
import { ChevronLeftIcon } from '@chakra-ui/icons';

export const Header = ({ backLinkUrl, backLinkLabel }) => {
  const buttonSize = useBreakpointValue({ base: 'md', sm: 'lg' });

  return (
    <header>
      <Box borderBottomWidth="1px">
        <HStack spacing={['8px', '16px']} py="16px" px="16px" maxW="xl" margin="0 auto">
          {backLinkUrl && (
            <NextLink href={backLinkUrl} passHref>
              <Button as="a" variant="link" size={buttonSize} leftIcon={<ChevronLeftIcon />}>
                {backLinkLabel}
              </Button>
            </NextLink>
          )}

          {backLinkUrl && <Spacer />}

          <LinkBox>
            <LinkOverlay href="https://stackup.sh/" target="_blank">
              <Image
                src="./logotype-blue-navy-32x142.png"
                maxW="142px"
                maxH="32px"
                alt="stackup logo"
              />
            </LinkOverlay>
          </LinkBox>
        </HStack>
      </Box>
    </header>
  );
};
