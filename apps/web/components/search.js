import {
  Button,
  Box,
  HStack,
  Image,
  Spacer,
  LinkBox,
  LinkOverlay,
  InputGroup,
  Input,
  InputRightElement,
} from '@chakra-ui/react';

export const Search = () => {
  return (
    <header>
      <Box borderBottomWidth="1px">
        <HStack spacing={['8px', '16px']} py="16px" px="16px" maxW="xl" margin="0 auto">
          <LinkBox>
            <LinkOverlay href="https://stackup.sh/" target="_blank">
              <Image src="./mark-blue.png" maxW="32px" maxH="32x" alt="stackup logo" />
            </LinkOverlay>
          </LinkBox>

          <Spacer />

          <InputGroup>
            <Input pr="88px" placeholder="Search for user" />
            <InputRightElement width="80px">
              <Button size="sm" colorScheme="blue" onClick={() => {}}>
                Search
              </Button>
            </InputRightElement>
          </InputGroup>
        </HStack>
      </Box>
    </header>
  );
};
