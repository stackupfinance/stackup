import React from 'react';
import {SwapSelectTokenSheet} from '../../components';
import {
  useNavigationStoreSwapSheetsSelector,
  useExplorerStoreSwapSheetsSelector,
} from '../../state';

export default function SwapSheets() {
  const {showSwapSelectTokenSheet, setShowSwapSelectTokenSheet} =
    useNavigationStoreSwapSheetsSelector();
  const {currencies} = useExplorerStoreSwapSheetsSelector();

  const onSwapSelectTokenClose = () => {
    setShowSwapSelectTokenSheet(false);
  };

  return (
    <>
      <SwapSelectTokenSheet
        isOpen={showSwapSelectTokenSheet.value}
        onClose={onSwapSelectTokenClose}
        onChange={showSwapSelectTokenSheet.onChange}
        currencyList={currencies.map(({currency, balance}) => ({
          currency,
          balance,
        }))}
      />
    </>
  );
}
