import create from 'zustand';
import { persist } from 'zustand/middleware';
// import axios from 'axios';
// import { App } from '../config';

export const holdingsUseAuthSelector = (state) => ({
  clear: state.clear,
});

export const holdingsHoldingsPageSelector = (state) => ({
  loading: state.loading,
  holdings: state.holdings,
  fetchHoldings: state.fetchHoldings,
});

const defaultState = {
  loading: false,
  holdings: undefined,
};

export const useHoldingsStore = create(
  persist(
    (set, get) => ({
      ...defaultState,

      fetchHoldings: async (options = {}) => {
        set({ loading: true });

        try {
          // TODO: Use real implementation
          const holdings = {
            totalEquityUsdc: '3600000',
            tokenList: [
              // First item is native token and not an ERC20 token
              // i.e. MATIC on Polygon or ETH on Ethereum/Rollups
              {
                name: 'Matic',
                symbol: 'MATIC',
                decimals: '18',
                valueWei: '1000000000000000000',
                logo: 'https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png?1624446912',
                valueUsdc: '1800000',
              },
              // Below here are all ERC20 Tokens
              {
                name: 'Wrapped Matic',
                symbol: 'wMATIC',
                decimals: '18',
                valueWei: '1000000000000000000',
                logo: 'https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png?1624446912',
                valueUsdc: '1800000',
              },
            ],
            nftList: [],
          };
          set({ loading: false, holdings });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      clear: () => set({ ...defaultState }),
    }),
    {
      name: 'stackup-holdings-store',
      partialize: (state) => {
        const { loading, ...persisted } = state;
        return persisted;
      },
    },
  ),
);
