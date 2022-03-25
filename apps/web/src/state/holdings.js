import { App } from '../config';
import create from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { ethers } from 'ethers';
import { provider } from '../../src/utils/web3';

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
          const getExchangeRates = async (tokens) => {
            const { data } = await axios.post(
              `${App.stackup.backendUrl}/v1/tokens/exchange-rates`,
              { tokens },
              { headers: { Authorization: `Bearer ${options.accessToken}` } },
            );
            const exchangeRates = {};
            const keys = Object.keys(data);
            keys.forEach((key) => {
              exchangeRates[key] = data[key];
              exchangeRates[key].price = ethers.BigNumber.from(data[key].price);
            });
            return exchangeRates;
          };

          const getExchangeRate = async (tokenFeedProxyAddress) => {
            const { data: answer } = await axios.get(
              `${App.stackup.backendUrl}/v1/tokens/${tokenFeedProxyAddress}/exchange-rate`,
              { headers: { Authorization: `Bearer ${options.accessToken}` } },
            );
            return ethers.BigNumber.from(answer);
          };

          const convertToUSDC = (value, exchangeRate, valueDecimals, exchangeRateDecimals) => {
            const valueUSD =
              exchangeRate * (1 / 10 ** exchangeRateDecimals) * (value * (1 / 10 ** valueDecimals));
            const valueUSDFixed = parseFloat(valueUSD.toFixed(2) * 1000000);
            return valueUSDFixed;
          };

          const getTokenList = async () => {
            const { data: tokenList } = await axios.get(
              `${App.stackup.backendUrl}/v1/tokens/token-list`,
              { headers: { Authorization: `Bearer ${options.accessToken}` } },
            );
            return tokenList;
          };

          const getWalletTokenBalances = async (tokens) => {
            const { data } = await axios.post(
              `${App.stackup.backendUrl}/v1/tokens/balances`,
              { tokenAddresses: tokens.map((token) => token.address) },
              { headers: { Authorization: `Bearer ${options.accessToken}` } },
            );
            return data;
          };

          const getNativeTokenBalance = async () => {
            const balance = await provider.getBalance(options.walletAddress);
            const exchangeRate = await getExchangeRate(App.web3.maticUsdPriceFeedProxy);
            const convertedBalance = convertToUSDC(balance, exchangeRate, 18, 8);
            return {
              name: 'Matic',
              symbol: 'MATIC',
              decimals: 18,
              valueWei: balance,
              logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
              valueUsdc: convertedBalance,
            };
          };

          const hydrateWalletHoldings = async () => {
            const tokenList = await getTokenList();
            const holdings = {};
            const tokenMap = {};
            const totalValueUSD = 0;
            const [balances, exchangeRateMap] = await Promise.all([
              getWalletTokenBalances(tokenList),
              getExchangeRates(tokenList),
            ]);

            if (balances?.tokenBalances?.length) {
              tokenList.forEach((token) => {
                tokenMap[token.address] = {
                  chainId: token.chainId,
                  address: token.address,
                  name: token.name,
                  symbol: token.symbol,
                  decimals: token.decimals,
                  logoURI: token.logoURI,
                };
              });

              const tokenListFormatted = balances.tokenBalances.map((token) => {
                const tokenData = tokenMap[token.contractAddress];
                const exchangeRate = exchangeRateMap[tokenData.symbol].price;
                const tokenDecimals = tokenMap[token.contractAddress].decimals;
                const exchangeRateDecimals = exchangeRateMap[tokenData.symbol].decimals;
                const convertedBalance = convertToUSDC(
                  token.tokenBalance,
                  exchangeRate,
                  tokenDecimals,
                  exchangeRateDecimals,
                );
                totalValueUSD += convertedBalance;

                return {
                  name: tokenData.name,
                  symbol: tokenData.symbol,
                  decimals: tokenData.decimals,
                  valueWei: token.tokenBalance,
                  logo: tokenData.logoURI,
                  valueUsdc: convertedBalance,
                };
              });

              holdings.totalEquityUsdc = totalValueUSD;
              holdings.tokenList = tokenListFormatted;
              holdings.nftList = [];
            }
            return holdings;
          };

          const [holdings, maticData] = await Promise.all([
            hydrateWalletHoldings(),
            getNativeTokenBalance(),
          ]);
          holdings.totalEquityUsdc += maticData.valueUsdc;
          holdings.tokenList.unshift(maticData);

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
