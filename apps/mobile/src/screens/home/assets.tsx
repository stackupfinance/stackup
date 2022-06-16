import React, {useState, useEffect} from 'react';
import {Box, Button, HStack} from 'native-base';
import type {CompositeScreenProps} from '@react-navigation/native';
import type {MaterialTopTabScreenProps} from '@react-navigation/material-top-tabs';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faSliders} from '@fortawesome/free-solid-svg-icons/faSliders';
import {faBars} from '@fortawesome/free-solid-svg-icons/faBars';
import {RootStackParamList, HomeTabParamList, AppColors} from '../../config';
import {
  TabScreenContainer,
  TabScreenHeader,
  HomeTabTitle,
  SecurityButton,
  IconButton,
  List,
  PortfolioBalance,
  PortfolioItem,
} from '../../components';
import {
  useNavigationStoreAssetsSelector,
  useSettingsStoreAssetsSelector,
  useWalletStoreAssetsSelector,
  useExplorerStoreAssetsSelector,
} from '../../state';

type Props = CompositeScreenProps<
  MaterialTopTabScreenProps<HomeTabParamList, 'Assets'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function AssetsScreen({navigation}: Props) {
  const {setShowSettingsSheet, setShowTokenListSheet, setShowDepositSheet} =
    useNavigationStoreAssetsSelector();
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const {network, quoteCurrency, currencies, timePeriod} =
    useSettingsStoreAssetsSelector();
  const {instance} = useWalletStoreAssetsSelector();
  const {
    loading: explorerLoading,
    walletBalance,
    currencies: currencyBalances,
    fetchAddressOverview,
  } = useExplorerStoreAssetsSelector();

  useEffect(() => {
    onRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSecurityPress = () => {
    navigation.navigate('Security');
  };

  const onSettingPress = () => {
    setShowSettingsSheet(true);
  };

  const onTokenListPress = () => {
    setShowTokenListSheet(true);
  };

  const onDepositPress = () => {
    setShowDepositSheet(true);
  };

  const onRefresh = () => {
    fetchAddressOverview(
      network,
      quoteCurrency,
      currencies,
      timePeriod,
      instance.walletAddress,
    );
  };

  return (
    <TabScreenContainer>
      <TabScreenHeader>
        <IconButton icon={faBars} onPress={onSettingPress} />

        <HomeTabTitle screen="Assets" network="Polygon" />

        <SecurityButton onPress={onSecurityPress} />
      </TabScreenHeader>

      <List
        onRefresh={onRefresh}
        isRefreshing={explorerLoading}
        header={
          <Box key="assets-header">
            <Box mt="20px">
              <PortfolioBalance
                previousBalance={walletBalance.previousBalance}
                currentBalance={walletBalance.currentBalance}
                currency={quoteCurrency}
                isHidden={isHidden}
                onToggleVisibility={() => setIsHidden(!isHidden)}
              />
            </Box>

            <HStack mt="33px" mb="31px" space="14px">
              <Button flex={1} onPress={onDepositPress}>
                Deposit
              </Button>

              <Button flex={1} onPress={() => {}}>
                Send
              </Button>
            </HStack>
          </Box>
        }
        sections={[
          {
            title: '',
            data: currencyBalances.map(currencyBalance => (
              <PortfolioItem
                key={currencyBalance.currency}
                currency={currencyBalance.currency}
                quoteCurrency={currencyBalance.quoteCurrency}
                balance={currencyBalance.balance}
                previousBalanceInQuoteCurrency={
                  currencyBalance.previousBalanceInQuoteCurrency
                }
                currentBalanceInQuoteCurrency={
                  currencyBalance.currentBalanceInQuoteCurrency
                }
                isHidden={isHidden}
              />
            )),
          },
        ]}
        footer={
          <Button
            key="assets-footer"
            colorScheme="text"
            variant="link"
            onPress={onTokenListPress}
            _text={{color: AppColors.text[4], fontWeight: 400}}
            leftIcon={
              <FontAwesomeIcon
                icon={faSliders}
                color={AppColors.text[4]}
                size={20}
              />
            }>
            Manage token list
          </Button>
        }
      />
    </TabScreenContainer>
  );
}
