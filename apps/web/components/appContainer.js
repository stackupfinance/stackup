import { Container, Center } from '@chakra-ui/react';

export const AppContainer = ({ children }) => {
  return (
    <Container mt={['32px', '128px']} maxW="xl">
      <Center>{children}</Center>
    </Container>
  );
};
