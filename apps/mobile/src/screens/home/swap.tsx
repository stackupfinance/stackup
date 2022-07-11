/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useMemo} from 'react';
import {RefreshControl} from 'react-native';
import {Box, Button, ScrollView, useToast} from 'native-base';
import type {MaterialTopTabScreenProps} from '@react-navigation/material-top-tabs';
import {BigNumberish, ethers} from 'ethers';
import {CurrencySymbols, HomeTabParamList, AppColors} from '../../config';
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
  useWalletStoreSwapSelector,
  useSwapStoreSwapSelector,
} from '../../state';
import {formatCurrency, formatRate} from '../../utils/currency';

type Props = MaterialTopTabScreenProps<HomeTabParamList, 'Swap'>;

export default function SwapScreen({}: Props) {
  const toast = useToast();
  const {setShowSwapSelectTokenSheet} = useNavigationStoreSwapSelector();
  const {network, quoteCurrency} = useSettingsStoreSwapSelector();
  const {instance} = useWalletStoreSwapSelector();
  const {loading, currencies, fetchSwapQuote} = useExplorerStoreSwapSelector();
  const {data, update} = useSwapStoreSwapSelector();

  const isDisabled = data.quote === null || data.fee === null;
  const isLoading = loading;

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

  const getQuote = async (
    bc: CurrencySymbols,
    qc: CurrencySymbols,
    v: BigNumberish,
  ) => {
    try {
      toast.show({
        title: 'Fetching the latest quotes...',
        backgroundColor: AppColors.palettes.primary[600],
        placement: 'bottom',
        duration: 15000,
      });

      const quote = await fetchSwapQuote(
        network,
        bc,
        qc,
        v,
        instance.walletAddress,
      );
      toast.closeAll();

      if (quote === null) {
        toast.show({
          title: 'Not enough liquidity',
          backgroundColor: AppColors.singletons.warning,
          placement: 'top',
        });
      }
      return quote;
    } catch (error) {
      toast.closeAll();
      throw error;
    }
  };

  const swapCurrencies = async () => {
    const quote = ethers.BigNumber.from(data.quoteCurrencyValue).isZero()
      ? null
      : await getQuote(
          data.quoteCurrency,
          data.baseCurrency,
          data.quoteCurrencyValue,
        );
    update({
      baseCurrency: data.quoteCurrency,
      quoteCurrency: data.baseCurrency,
      baseCurrencyValue: data.quoteCurrencyValue,
      quoteCurrencyValue: quote?.amount || '0',
      quote,
    });
  };

  const onBaseCurrencyChange = () => {
    setShowSwapSelectTokenSheet(true, async currency => {
      setShowSwapSelectTokenSheet(false);
      if (currency !== data.baseCurrency) {
        if (currency === data.quoteCurrency) {
          swapCurrencies();
        } else {
          update({
            baseCurrency: currency,
            baseCurrencyValue: '0',
            quoteCurrencyValue: '0',
            quote: null,
          });
        }
      }
    });
  };

  const onQuoteCurrencyChange = () => {
    setShowSwapSelectTokenSheet(true, async currency => {
      setShowSwapSelectTokenSheet(false);
      if (currency !== data.quoteCurrency) {
        if (currency === data.baseCurrency) {
          swapCurrencies();
        } else {
          const quote = ethers.BigNumber.from(data.baseCurrencyValue).isZero()
            ? null
            : await getQuote(
                data.baseCurrency,
                currency,
                data.baseCurrencyValue,
              );
          update({
            quoteCurrency: currency,
            quoteCurrencyValue: quote?.amount ?? '0',
            quote,
          });
        }
      }
    });
  };

  const onBaseCurrencyValueChange = async (value: BigNumberish) => {
    const quote = ethers.BigNumber.from(value).isZero()
      ? null
      : await getQuote(data.baseCurrency, data.quoteCurrency, value);
    update({
      baseCurrencyValue: value,
      quoteCurrencyValue: quote?.amount ?? '0',
      quote,
    });
  };

  const onSwapPress = () => {
    swapCurrencies();
  };

  const onRefresh = async () => {
    const quote = await getQuote(
      data.baseCurrency,
      data.quoteCurrency,
      data.baseCurrencyValue,
    );
    update({
      quoteCurrencyValue: quote?.amount ?? '0',
      quote,
    });
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
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }>
        <Box mt="54px">
          <CurrencySwap
            isDisabled={isLoading}
            baseCurrency={data.baseCurrency}
            quoteCurrency={data.quoteCurrency}
            baseCurrencyValue={data.baseCurrencyValue}
            quoteCurrencyValue={data.quoteCurrencyValue}
            currencyBalances={currencyBalances}
            onBaseCurrencyPress={onBaseCurrencyChange}
            onQuoteCurrencyPress={onQuoteCurrencyChange}
            onBaseCurrencyValueChange={onBaseCurrencyValueChange}
            onSwapPress={onSwapPress}
          />
        </Box>

        {data.quote !== null && (
          <Box mt="42px">
            <SummaryTable
              rows={[
                {
                  key: 'Rate',
                  value: formatRate(
                    data.baseCurrency,
                    data.quoteCurrency,
                    data.quote?.rate || '0',
                  ),
                },
                {
                  key: 'Fee',
                  value: data.fee
                    ? formatCurrency(data.fee.value, data.fee.currency)
                    : '',
                  isLoading: true,
                },
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
