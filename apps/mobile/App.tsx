import './shims';

import React, {ReactNode, useState} from 'react';
import {ActivityIndicator, Button} from 'react-native';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {wallet} from '@stackupfinance/walletjs';

const Section: React.FC<{
  children?: ReactNode;
  title: string;
}> = ({children, title}) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={[styles.sectionTitle]}>{title}</Text>
      <Text style={[styles.sectionDescription]}>{children}</Text>
    </View>
  );
};

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [w, setWallet]: [any, any] = useState();
  const [s1, setSigner1]: [any, any] = useState();
  const [rs, setReencryptSigner]: [any, any] = useState();
  const [s2, setSigner2]: [any, any] = useState();
  const [s3, setSigner3]: [any, any] = useState();
  const [loading, setLoading] = useState(false);

  const checkWalletJs = async () => {
    setLoading(true);

    // NOTE: crypto functions should be wrapped in a setTimeout
    // to prevent blocking of the UI.
    setTimeout(async () => {
      const _w = await wallet.proxy.initEncryptedIdentity('password', 'salt');
      setWallet(_w);

      const _s1 = await wallet.proxy.decryptSigner(_w, 'password', 'salt');
      setSigner1(_s1);

      const _rs = await wallet.proxy.reencryptSigner(
        _w,
        'password',
        'newPassword',
        'salt',
      );
      setReencryptSigner(_rs);

      const _s2 = await wallet.proxy.decryptSigner(
        {encryptedSigner: _rs},
        'newPassword',
        'salt',
      );
      setSigner2(_s2);

      const _s3 = await wallet.proxy.decryptSigner(_w, 'wrongPassword', 'salt');
      setSigner3(_s3);

      setLoading(false);
    });
  };

  return (
    <SafeAreaView>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View>
          <Section title="walletjs: initEncryptedIdentity()">
            <Text style={[styles.sectionBody]}>{JSON.stringify(w)}</Text>
          </Section>

          <Section title="walletjs: decryptSigner()">
            <Text style={[styles.sectionBody]}>{JSON.stringify(s1)}</Text>
          </Section>

          <Section title="walletjs: reencryptSigner()">
            <Text style={[styles.sectionBody]}>{rs}</Text>
          </Section>

          <Section title="walletjs: checks">
            {w && (
              <>
                <Text style={[styles.sectionBody]}>
                  wallet.initOwner === signer.address:{' '}
                  {(w?.initOwner === s1?.address).toString()}
                  {'\n'}
                </Text>

                <Text style={[styles.sectionBody]}>
                  reencryptSigner decrypts to same signer:{' '}
                  {(JSON.stringify(s1) === JSON.stringify(s2)).toString()}
                  {'\n'}
                </Text>

                <Text style={[styles.sectionBody]}>
                  wallet.encryptedSigner !== reencryptSigner:{' '}
                  {(w?.encryptedSigner !== rs).toString()}
                  {'\n'}
                </Text>

                <Text style={[styles.sectionBody]}>
                  wrong password returns undefined:{' '}
                  {(s3 === undefined).toString()}
                  {'\n'}
                </Text>
              </>
            )}
          </Section>

          {loading && <ActivityIndicator />}

          <Button title="Generate" onPress={checkWalletJs} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  sectionBody: {
    fontSize: 14,
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
