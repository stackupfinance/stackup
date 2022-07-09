import React from 'react';
import {SwapSelectTokenSheet} from '../../components';
import {
  useNavigationStoreSwapSheetsSelector,
  useExplorerStoreSwapSheetsSelector,
} from '../../state';

export default function SwapSheets() {
  const {showSwapSelectToken, setShowSwapSelectToken} =
    useNavigationStoreSwapSheetsSelector();
  const {currencies} = useExplorerStoreSwapSheetsSelector();

  const onSwapSelectTokenClose = () => {
    setShowSwapSelectToken(false);
  };

  return (
    <>
      <SwapSelectTokenSheet
        isOpen={showSwapSelectToken.value}
        onClose={onSwapSelectTokenClose}
        onChange={showSwapSelectToken.onChange}
        currencyList={currencies.map(({currency, balance}) => ({
          currency,
          balance,
        }))}
      />
    </>
  );
}
