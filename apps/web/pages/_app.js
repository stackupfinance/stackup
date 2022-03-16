import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { IntercomProvider } from 'react-use-intercom';
import { useAuth } from '../src/hooks';
import { AlphaBanner } from '../src/components';
import { IntercomManager, Web3Transactions } from '../src/containers';
import { App as AppConfig } from '../src/config';
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
    <IntercomProvider appId={AppConfig.intercom.appId}>
      <IntercomManager>
        <ChakraProvider theme={theme}>
          <Web3Transactions>
            {AppConfig.featureFlag.alphaBanner ? <AlphaBanner /> : undefined}
            <Component {...pageProps} />
          </Web3Transactions>
        </ChakraProvider>
      </IntercomManager>
    </IntercomProvider>
  );
}

export default App;
