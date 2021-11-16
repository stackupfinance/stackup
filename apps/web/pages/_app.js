import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { useAuth } from '../src/hooks';

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
});

function App({ Component, pageProps }) {
  useAuth();

  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default App;
