import React, {useState} from 'react';
import {
  Box,
  Heading,
  Button,
  Text,
  HStack,
  VStack,
  useColorMode,
  useTheme,
  useDisclose,
} from 'native-base';
import type {CompositeScreenProps} from '@react-navigation/native';
import type {MaterialTopTabScreenProps} from '@react-navigation/material-top-tabs';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList, HomeTabParamList} from '../../config';
import {useRemoveWallet} from '../../hooks';
import {ScreenContainer, ScreenHeader} from '../../components';
import Settings from '../../components/Settings';
import PortfolioBalance from '../../components/PortfolioBalance';
import List from '../../components/List';
import {BitcoinAvatar} from '../../../assets/images';
import {EthereumAvatar} from '../../../assets/images';
import {USDCAvatar} from '../../../assets/images';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faSliders} from '@fortawesome/free-solid-svg-icons/faSliders';
import {useIntercomStoreSettingsSelector} from '../../state';

type Props = CompositeScreenProps<
  MaterialTopTabScreenProps<HomeTabParamList, 'Assets'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function AssetsScreen({navigation}: Props) {
  const removeWallet = useRemoveWallet();
  const {openMessenger} = useIntercomStoreSettingsSelector();

  // temp: for color testing
  const {toggleColorMode} = useColorMode();
  const {isOpen, onOpen, onClose} = useDisclose();

  const {colors} = useTheme();

  // PortfolioBalance props
  const [balanceIsHidden, setBalanceIsHidden] = useState(false);
  const toggleVisibilityHandler = () => setBalanceIsHidden(!balanceIsHidden);

  // List props
  const tokenData = [
    {
      name: 'Bitcoin',
      id: '1',
      value: '1.332 BTC',
      valueUSDC: '$52,472',
      percentChange: '19',
      valueChange: '9230',
      imgSrc: BitcoinAvatar,
    },
    {
      name: 'Ethereum',
      id: '2',
      value: '8.123 ETH',
      valueUSDC: '$20,504',
      percentChange: '-10',
      valueChange: '-2050',
      imgSrc: EthereumAvatar,
    },
    {
      name: 'USDC',
      id: '3',
      value: '24,300 USDC',
      valueUSDC: '$24,180',
      percentChange: '40',
      valueChange: '10000',
      imgSrc: USDCAvatar,
    },
  ];

  return (
    <ScreenContainer>
      <ScreenHeader>
        <Heading fontSize="16px" fontFamily="heading">
          Assets
        </Heading>
      </ScreenHeader>

      <Box>
        <PortfolioBalance
          balance={96147.47}
          valueChange={21170}
          changePercent={22}
          isHidden={balanceIsHidden}
          toggleVisibility={toggleVisibilityHandler}
        />

        <HStack mx="4" space={3} justifyContent="center">
          <Button _text={{fontWeight: '700'}} my="5" py="5" width="50%">
            Deposit
          </Button>
          <Button _text={{fontWeight: '700'}} my="5" py="5" width="50%">
            Send
          </Button>
        </HStack>

        <List data={tokenData} title="Token List" />

        <HStack my="4" justifyContent="center">
          <FontAwesomeIcon
            icon={faSliders}
            style={{
              /* @ts-ignore */
              color: colors.text[4],
            }}
            size={20}
          />
          <Text mx="4">Manage token list</Text>
        </HStack>

        <VStack mx="4" my="5">
          <Button colorScheme="tertiary" onPress={removeWallet}>
            Remove wallet
          </Button>

          <Button mb="16px" colorScheme="secondary" onPress={onOpen}>
            Settings
          </Button>

          <Button onPress={toggleColorMode} my="5" py="5">
            <Text>Toggle color mode</Text>
          </Button>

          <Button mb="16px" onPress={() => navigation.navigate('Security')}>
            Security Overview
          </Button>

          <Button mb="16px" colorScheme="secondary" onPress={openMessenger}>
            Display messenger
          </Button>
        </VStack>
      </Box>
      <Settings isOpen={isOpen} onClose={onClose} />
    </ScreenContainer>
  );
}
