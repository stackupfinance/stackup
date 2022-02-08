import { Container, Center } from '@chakra-ui/react';

export const AppContainer = ({ minMargin, children }) => {
  return (
    <Container my={minMargin ? ['8px', '16px'] : ['32px', '64px']} maxW="xl">
      <Center>{children}</Center>
    </Container>
  );
};
