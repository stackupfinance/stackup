/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useMemo, useState} from 'react';
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
  useBundlerStoreSwapSelector,
  useSwapStoreSwapSelector,
} from '../../state';
import {formatCurrency, formatRate} from '../../utils/currency';

type Props = MaterialTopTabScreenProps<HomeTabParamList, 'Swap'>;

export default function SwapScreen({}: Props) {
  const toast = useToast();
  const {setShowSwapSelectTokenSheet, setShowSwapReviewOrderSheet} =
    useNavigationStoreSwapSelector();
  const {network, quoteCurrency: defaultCurrency} =
    useSettingsStoreSwapSelector();
  const {instance} = useWalletStoreSwapSelector();
  const {
    loading: explorerLoading,
    currencies,
    fetchGasEstimate,
    fetchSwapQuote,
  } = useExplorerStoreSwapSelector();
  const {loading: bundlerLoading, fetchPaymasterStatus} =
    useBundlerStoreSwapSelector();
  const {data, update} = useSwapStoreSwapSelector();
  const [debounceLoading, setDebounceLoading] = useState<boolean>(false);

  const isDisabled =
    data.quote === null || data.gasEstimate === null || data.status === null;
  const isLoading = debounceLoading || explorerLoading || bundlerLoading;

  const currencyBalances = useMemo(
    () =>
      currencies.reduce((prev, curr) => {
        return {...prev, [curr.currency]: curr.balance};
      }, {}),
    [currencies],
  );

  useEffect(() => {
    update({baseCurrency: defaultCurrency});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultCurrency]);

  const getSwapData = async (
    bc: CurrencySymbols,
    qc: CurrencySymbols,
    v: BigNumberish,
  ) => {
    if (ethers.BigNumber.from(v).isZero()) {
      return {quote: null, gasEstimate: null, status: null};
    }

    try {
      toast.show({
        title: 'Fetching the latest quotes...',
        backgroundColor: AppColors.palettes.primary[600],
        placement: 'bottom',
        duration: 15000,
      });

      setDebounceLoading(true);
      const [quote, gasEstimate, status] = await Promise.all([
        fetchSwapQuote(network, bc, qc, v, instance.walletAddress),
        fetchGasEstimate(network),
        fetchPaymasterStatus(instance.walletAddress, network),
      ]);
      setDebounceLoading(false);
      toast.closeAll();

      if (quote === null) {
        toast.show({
          title: 'Not enough liquidity',
          backgroundColor: AppColors.singletons.warning,
          placement: 'top',
        });

        return {quote: null, gasEstimate: null, status: null};
      }

      return {quote, gasEstimate, status};
    } catch (error) {
      setDebounceLoading(false);
      toast.closeAll();
      throw error;
    }
  };

  const swapCurrencies = async () => {
    const swapData = await getSwapData(
      data.quoteCurrency,
      data.baseCurrency,
      data.quoteCurrencyValue,
    );
    update({
      baseCurrency: data.quoteCurrency,
      quoteCurrency: data.baseCurrency,
      baseCurrencyValue: data.quoteCurrencyValue,
      quoteCurrencyValue: swapData.quote?.amount || '0',
      ...swapData,
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
            ...(await getSwapData(data.baseCurrency, data.quoteCurrency, '0')),
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
          const swapData = await getSwapData(
            data.baseCurrency,
            currency,
            data.baseCurrencyValue,
          );
          update({
            quoteCurrency: currency,
            quoteCurrencyValue: swapData.quote?.amount || '0',
            ...swapData,
          });
        }
      }
    });
  };

  const onBaseCurrencyValueChange = async (value: BigNumberish) => {
    const swapData = await getSwapData(
      data.baseCurrency,
      data.quoteCurrency,
      value,
    );
    update({
      baseCurrencyValue: value,
      quoteCurrencyValue: swapData.quote?.amount || '0',
      ...swapData,
    });
  };

  const onSwapPress = () => {
    swapCurrencies();
  };

  const onRefresh = async () => {
    const swapData = await getSwapData(
      data.baseCurrency,
      data.quoteCurrency,
      data.baseCurrencyValue,
    );
    update({
      quoteCurrencyValue: swapData.quote?.amount || '0',
      ...swapData,
    });
  };

  const onReviewOrderPress = () => {
    setShowSwapReviewOrderSheet(true);
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

        {!isDisabled && (
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
                  isLoading,
                },
                {
                  key: 'Fee',
                  value: data.status
                    ? formatCurrency(
                        data.status.fees[defaultCurrency] ?? '0',
                        defaultCurrency,
                      )
                    : '',
                  isLoading,
                },
              ]}
            />
          </Box>
        )}

        <Box flex={1} />

        <Button
          mb="34px"
          isDisabled={isDisabled}
          isLoading={isLoading}
          onPress={onReviewOrderPress}>
          Review Order
        </Button>
      </ScrollView>
    </TabScreenContainer>
  );
}
