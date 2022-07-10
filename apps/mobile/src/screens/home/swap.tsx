/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useMemo} from 'react';
import {RefreshControl} from 'react-native';
import {Box, Button, ScrollView} from 'native-base';
import type {MaterialTopTabScreenProps} from '@react-navigation/material-top-tabs';
import {BigNumberish, ethers} from 'ethers';
import {HomeTabParamList} from '../../config';
import {
  TabScreenContainer,
  TabScreenHeader,
  HomeTabTitle,
  CurrencySwap,
  SummaryTable,
} from '../../components';
import {
  useNavigationStoreSwapSelector,
  useSettingsStoreSwapSelector,
  useExplorerStoreSwapSelector,
  useSwapStoreSwapSelector,
} from '../../state';

type Props = MaterialTopTabScreenProps<HomeTabParamList, 'Swap'>;

export default function SwapScreen({}: Props) {
  const {setShowSwapSelectToken} = useNavigationStoreSwapSelector();
  const {quoteCurrency} = useSettingsStoreSwapSelector();
  const {currencies} = useExplorerStoreSwapSelector();
  const {data, update} = useSwapStoreSwapSelector();

  const isDisabled = true;
  const isLoading = false;

  const currencyBalances = useMemo(
    () =>
      currencies.reduce((prev, curr) => {
        return {...prev, [curr.currency]: curr.balance};
      }, {}),
    [currencies],
  );

  useEffect(() => {
    update({baseCurrency: quoteCurrency});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteCurrency]);

  const swapCurrencies = () => {
    update({
      baseCurrency: data.quoteCurrency,
      quoteCurrency: data.baseCurrency,
      baseCurrencyValue: data.quoteCurrencyValue,
      quoteCurrencyValue: data.baseCurrencyValue,
    });
  };

  const onBaseCurrencyChange = () => {
    setShowSwapSelectToken(true, currency => {
      if (currency !== data.baseCurrency) {
        if (currency === data.quoteCurrency) {
          swapCurrencies();
        } else {
          update({baseCurrency: currency, baseCurrencyValue: '0'});
        }
      }
      setShowSwapSelectToken(false);
    });
  };

  const onQuoteCurrencyChange = () => {
    setShowSwapSelectToken(true, currency => {
      if (currency !== data.quoteCurrency) {
        if (currency === data.baseCurrency) {
          swapCurrencies();
        } else {
          update({quoteCurrency: currency, quoteCurrencyValue: '0'});
        }
      }
      setShowSwapSelectToken(false);
    });
  };

  const onBaseCurrencyValueChange = (value: BigNumberish) => {
    update({
      baseCurrencyValue: value,
      quoteCurrencyValue: ethers.BigNumber.from(value).isZero()
        ? '0'
        : data.quoteCurrencyValue,
    });
  };

  const onQuoteCurrencyValueChange = (value: BigNumberish) => {
    update({
      quoteCurrencyValue: value,
      baseCurrencyValue: ethers.BigNumber.from(value).isZero()
        ? '0'
        : data.baseCurrencyValue,
    });
  };

  const onSwapPress = () => {
    swapCurrencies();
  };

  return (
    <TabScreenContainer>
      <TabScreenHeader>
        <Box />

        <HomeTabTitle screen="Swap" network="Polygon" />

        <Box />
      </TabScreenHeader>

      <ScrollView
        contentContainerStyle={{flex: 1}}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => {}} />
        }>
        <Box mt="54px">
          <CurrencySwap
            baseCurrency={data.baseCurrency}
            quoteCurrency={data.quoteCurrency}
            baseCurrencyValue={data.baseCurrencyValue}
            quoteCurrencyValue={data.quoteCurrencyValue}
            currencyBalances={currencyBalances}
            onBaseCurrencyPress={onBaseCurrencyChange}
            onQuoteCurrencyPress={onQuoteCurrencyChange}
            onBaseCurrencyValueChange={onBaseCurrencyValueChange}
            onQuoteCurrencyValueChange={onQuoteCurrencyValueChange}
            onSwapPress={onSwapPress}
          />
        </Box>

        {!isDisabled && (
          <Box mt="42px">
            <SummaryTable
              rows={[
                {key: 'Rate', value: '1 USD ≈ 0.00081 ETH'},
                {key: 'Fee', value: '$0.11'},
              ]}
            />
          </Box>
        )}

        <Box flex={1} />

        <Button mb="34px" isDisabled={isDisabled} isLoading={isLoading}>
          Review Order
        </Button>
      </ScrollView>
    </TabScreenContainer>
  );
}
