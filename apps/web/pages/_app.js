import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { useAuth } from '../src/hooks';
import { Web3Transactions } from '../src/containers';
import '../styles.css';

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
      <Web3Transactions>
        <Component {...pageProps} />
      </Web3Transactions>
    </ChakraProvider>
  );
}

export default App;
