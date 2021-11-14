import { Container, Center } from '@chakra-ui/react';

export const AppContainer = ({ minMargin, children }) => {
  return (
    <Container mt={minMargin ? '16px' : ['32px', '128px']} maxW="xl">
      <Center>{children}</Center>
    </Container>
  );
};
