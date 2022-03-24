import { App } from '../config';
import create from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { ethers } from 'ethers';
import { provider, getChainId } from '../../src/utils/web3';

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
          // blockchain network information
          const chainId = await getChainId();
          const maticUsdPriceFeedProxy = process.env.NEXT_PUBLIC_MATIC_USD_PRICE_FEED_PROXY;
          
          // get current exchange rates for all tokens
          const getExchangeRates = async (tokens) => {
            const { data } = await axios.post(`${App.stackup.backendUrl}/v1/tokens/exchange-rates`,
              { tokens },
              { headers: { Authorization: `Bearer ${options.accessToken}` } },
            );
            const exchangeRates = {};
            const keys = Object.keys(data);
            keys.forEach((key) => {
              exchangeRates[key] = data[key];
              exchangeRates[key].price = ethers.BigNumber.from(data[key].price)
            });
            return exchangeRates;
          }

          // get current exchange rates for a single token
          const getExchangeRate = async (tokenFeedProxyAddress) => {
            const { data: answer } = await axios.get(`${App.stackup.backendUrl}/v1/tokens/${tokenFeedProxyAddress}/exchange-rate`,
              { headers: { Authorization: `Bearer ${options.accessToken}` } },
            );
            return ethers.BigNumber.from(answer);
          }

          const convertToUSDC = (value, exchangeRate, valueDecimals, exchangeRateDecimals) => {
            const valueUSD = (exchangeRate * (1 / (10 ** exchangeRateDecimals))) * (value * (1 / (10 ** valueDecimals)));
            const valueUSDFixed = parseFloat(valueUSD.toFixed(2) * 1000000);
            return valueUSDFixed;
          }

          const getTokenList = async () => {
            const { data: tokenList } = await axios.get(`${App.stackup.backendUrl}/v1/tokens/token-list`,
              { headers: { Authorization: `Bearer ${options.accessToken}` } },
            );
            return tokenList;
          }

          const getWalletTokenHoldings = async () => {
            const { data: holdings } = await axios.get(
              `${App.stackup.backendUrl}/v1/users/${options.userId}/wallet/holdings`,
              { headers: { Authorization: `Bearer ${options.accessToken}` } },
            );
            return holdings;
          }
          
          const getWalletMATICBalance = async () => {
            const maticBalance = await provider.getBalance(options.walletAddress);
            const exchangeRate = await getExchangeRate(maticUsdPriceFeedProxy);
            const convertedBalance = convertToUSDC(maticBalance, exchangeRate, 18, 8);
            return {
              name: "Polygon",
              symbol: 'MATIC',
              decimals: 18,
              valueWei: maticBalance,
              logo: "https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png?1624446912",
              valueUsdc: convertedBalance,
            };
          }

          const hydrateWalletHoldings = async () => {
            // map of wallet holdings
            const holdings = {};
            const totalValueUSD = 0;
            const balances = await getWalletTokenHoldings();
            if (balances && balances.tokenBalances && 
              Array.isArray(balances.tokenBalances) && balances.tokenBalances.length) {
              // normalized token map for quick referencing of held token metadata
              const tokenMap = {}
              // whitelist of tokens to query for
              const tokenList = await getTokenList();

              // utility map for populating token data
              tokenList.forEach(token => {
                tokenMap[token.address] = {
                  "chainId": token.chainId,
                  "address": token.address,
                  "name": token.name,
                  "symbol": token.symbol,
                  "decimals": token.decimals,
                  "logoURI": token.logoURI
                };
              });

              const exchangeRateMap = await getExchangeRates(tokenList);
      
              const tokenListFormatted = balances.tokenBalances.map(token => {
                const tokenData = tokenMap[token.contractAddress];
                const exchangeRate = exchangeRateMap[tokenData.symbol].price;
                const tokenDecimals = tokenMap[token.contractAddress].decimals;
                const exchangeRateDecimals = exchangeRateMap[tokenData.symbol].decimals;
                const convertedBalance = convertToUSDC(token.tokenBalance, exchangeRate, tokenDecimals, exchangeRateDecimals);
                totalValueUSD += convertedBalance;
                
                return {
                  name: tokenData.name,
                  symbol: tokenData.symbol,
                  decimals: tokenData.decimals,
                  valueWei: token.tokenBalance,
                  logo: tokenData.logoURI,
                  valueUsdc: convertedBalance
                };
              });

              holdings.totalEquityUsdc = totalValueUSD;
              holdings.tokenList = tokenListFormatted;
              holdings.nftList = [];
            }
            return holdings;
          }

          // get ERC-20 token holdings
          const holdings = await hydrateWalletHoldings();

          // add MATIC token
          const maticData = await getWalletMATICBalance();
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
