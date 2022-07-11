import create from 'zustand';
import {devtools} from 'zustand/middleware';
import {BigNumberish} from 'ethers';
import {CurrencySymbols, OptimalQuote, Fee} from '../config';

interface SwapData {
  baseCurrency: CurrencySymbols;
  quoteCurrency: CurrencySymbols;
  baseCurrencyValue: BigNumberish;
  quoteCurrencyValue: BigNumberish;
  quote: OptimalQuote | null;
  fee: Fee | null;
}

interface SwapStateConstants {
  data: SwapData;
}

interface SwapState extends SwapStateConstants {
  update: (patch: Partial<SwapData>) => void;

  clear: () => void;
}

const defaults: SwapStateConstants = {
  data: {
    baseCurrency: 'USDC',
    quoteCurrency: 'ETH',
    baseCurrencyValue: '0',
    quoteCurrencyValue: '0',
    quote: null,
    fee: null,
  },
};

const STORE_NAME = 'stackup-swap-store';
const useSwapStore = create<SwapState>()(
  devtools(
    (set, get) => ({
      ...defaults,

      update: patch => {
        set({data: {...get().data, ...patch}});
      },

      clear: () => {
        set({...defaults});
      },
    }),
    {name: STORE_NAME},
  ),
);

export const useSwapStoreRemoveWalletSelector = () =>
  useSwapStore(state => ({clear: state.clear}));

export const useSwapStoreHomeSelector = () =>
  useSwapStore(state => ({clear: state.clear}));

export const useSwapStoreSwapSelector = () =>
  useSwapStore(state => ({
    data: state.data,
    update: state.update,
  }));
