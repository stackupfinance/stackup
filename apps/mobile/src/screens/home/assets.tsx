import React, {useState, useEffect, useMemo} from 'react';
import {Box, Button, HStack} from 'native-base';
import type {CompositeScreenProps} from '@react-navigation/native';
import type {MaterialTopTabScreenProps} from '@react-navigation/material-top-tabs';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faSliders} from '@fortawesome/free-solid-svg-icons/faSliders';
import {faBars} from '@fortawesome/free-solid-svg-icons/faBars';
import {RootStackParamList, HomeTabParamList, AppColors} from '../../config';
import {logEvent} from '../../utils/analytics';
import {
  TabScreenContainer,
  TabScreenHeader,
  HomeTabTitle,
  // SecurityButton,
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
  const {
    setShowSettingsSheet,
    setShowTokenListSheet,
    setShowDepositSheet,
    setShowSelectCurrencySheet,
  } = useNavigationStoreAssetsSelector();
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const {
    network,
    quoteCurrency,
    timePeriod,
    currencies: enabledCurrencies,
  } = useSettingsStoreAssetsSelector();
  const {instance} = useWalletStoreAssetsSelector();
  const {
    loading: explorerLoading,
    walletBalance,
    currencies,
    fetchAddressOverview,
  } = useExplorerStoreAssetsSelector();

  const currencySet = useMemo(
    () => new Set(enabledCurrencies),
    [enabledCurrencies],
  );

  useEffect(() => {
    onRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // TODO: Remove this when enabling security button
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onSecurityPress = () => {
    logEvent('NAVIGATE_SECURITY');
    navigation.navigate('Security');
  };

  const onSettingPress = () => {
    logEvent('OPEN_SETTINGS');
    setShowSettingsSheet(true);
  };

  const onTokenListPress = () => {
    logEvent('MANAGE_CURRENCY_LIST');
    setShowTokenListSheet(true);
  };

  const onDepositPress = () => {
    logEvent('DEPOSIT');
    setShowDepositSheet(true);
  };

  const onSendPress = () => {
    logEvent('SEND');
    setShowSelectCurrencySheet(true);
  };

  const onRefresh = () => {
    fetchAddressOverview(
      network,
      quoteCurrency,
      timePeriod,
      instance.walletAddress,
    );
  };

  return (
    <TabScreenContainer>
      <TabScreenHeader>
        <IconButton icon={faBars} onPress={onSettingPress} />

        <HomeTabTitle screen="Assets" network="Polygon" />

        <Box
        // TODO: Remove this when enabling security button
        />
        {/* <SecurityButton onPress={onSecurityPress} /> */}
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

              <Button flex={1} onPress={onSendPress}>
                Send
              </Button>
            </HStack>
          </Box>
        }
        sections={[
          {
            title: '',
            data: currencies
              .filter(currency => currencySet.has(currency.currency))
              .map(currency => (
                <PortfolioItem
                  key={currency.currency}
                  currency={currency.currency}
                  quoteCurrency={currency.quoteCurrency}
                  balance={currency.balance}
                  previousBalanceInQuoteCurrency={
                    currency.previousBalanceInQuoteCurrency
                  }
                  currentBalanceInQuoteCurrency={
                    currency.currentBalanceInQuoteCurrency
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
            Manage currency list
          </Button>
        }
      />
    </TabScreenContainer>
  );
}
