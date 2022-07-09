import React, {useEffect} from 'react';
import {Box, Button} from 'native-base';
import type {MaterialTopTabScreenProps} from '@react-navigation/material-top-tabs';
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
  useSwapStoreSwapSelector,
} from '../../state';

type Props = MaterialTopTabScreenProps<HomeTabParamList, 'Swap'>;

export default function SwapScreen({}: Props) {
  const {setShowSwapSelectToken} = useNavigationStoreSwapSelector();
  const {quoteCurrency} = useSettingsStoreSwapSelector();
  const {data, update} = useSwapStoreSwapSelector();

  useEffect(() => {
    update({baseCurrency: quoteCurrency});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteCurrency]);

  const onBaseCurrencyChange = () => {
    setShowSwapSelectToken(true, currency => {
      update({baseCurrency: currency});
      setShowSwapSelectToken(false);
    });
  };

  const onQuoteCurrencyChange = () => {
    setShowSwapSelectToken(true, currency => {
      update({quoteCurrency: currency});
      setShowSwapSelectToken(false);
    });
  };

  return (
    <TabScreenContainer>
      <TabScreenHeader>
        <Box />

        <HomeTabTitle screen="Swap" network="Polygon" />

        <Box />
      </TabScreenHeader>

      <Box mt="54px">
        <CurrencySwap
          baseCurrency={data.baseCurrency}
          quoteCurrency={data.quoteCurrency}
          onBaseCurrencyPress={onBaseCurrencyChange}
          onQuoteCurrencyPress={onQuoteCurrencyChange}
        />
      </Box>

      <Box mt="42px">
        <SummaryTable
          rows={[
            {key: 'Rate', value: '1 USD ≈ 0.00081 ETH'},
            {key: 'Fee', value: '$0.11'},
          ]}
        />
      </Box>

      <Box flex={1} />

      <Button mb="34px">Review Order</Button>
    </TabScreenContainer>
  );
}
