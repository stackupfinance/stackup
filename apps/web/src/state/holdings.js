import { App } from '../config';
import create from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import priceFeedProxies from '../utils/chainlinkDataFeeds';
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
          // blockchain network information
          const polygonNetwork = process.env.NEXT_PUBLIC_POLYGON_NETWORK;
          const chainId = process.env.NEXT_PUBLIC_POLYGON_NETWORK_CHAIN_ID;
          // Chainlink price feed ABI
          const aggregatorV3InterfaceABI = [{ "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "description", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint80", "name": "_roundId", "type": "uint80" }], "name": "getRoundData", "outputs": [{ "internalType": "uint80", "name": "roundId", "type": "uint80" }, { "internalType": "int256", "name": "answer", "type": "int256" }, { "internalType": "uint256", "name": "startedAt", "type": "uint256" }, { "internalType": "uint256", "name": "updatedAt", "type": "uint256" }, { "internalType": "uint80", "name": "answeredInRound", "type": "uint80" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "latestRoundData", "outputs": [{ "internalType": "uint80", "name": "roundId", "type": "uint80" }, { "internalType": "int256", "name": "answer", "type": "int256" }, { "internalType": "uint256", "name": "startedAt", "type": "uint256" }, { "internalType": "uint256", "name": "updatedAt", "type": "uint256" }, { "internalType": "uint80", "name": "answeredInRound", "type": "uint80" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "version", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }]
          
          // get current exchange rates for all tokens
          const getExchangeRates = async (tokens) => {
            // map of current exchange rates for tokens in wallet
            const exchangeRateMap = {};
            const promises = tokens.map(async (token) => {
              const tokenFeedProxyAddress = priceFeedProxies.polygon[polygonNetwork][token.symbol].address;
              const tokenFeedProxyDecimals = priceFeedProxies.polygon[polygonNetwork][token.symbol].decimals;
              const priceFeed = new ethers.Contract(tokenFeedProxyAddress, aggregatorV3InterfaceABI, provider);
              const roundData = await priceFeed.latestRoundData();
              const price = roundData.answer;
              exchangeRateMap[token.symbol] = {
                price,
                decimals: tokenFeedProxyDecimals
              };
            });

            await Promise.all(promises);
            return exchangeRateMap;
          }

          // get current exchange rates for a single token
          const getExchangeRate = async (tokenFeedProxyAddress) => {
            const priceFeed = new ethers.Contract(tokenFeedProxyAddress, aggregatorV3InterfaceABI, provider);
            const roundData = await priceFeed.latestRoundData();
            return roundData.answer;
          }

          const convertToUSDC = (value, exchangeRate, valueDecimals, exchangeRateDecimals) => {
            const valueUSD = (exchangeRate * (1 / (10 ** exchangeRateDecimals))) * (value * (1 / (10 ** valueDecimals)));
            const valueUSDFixed = parseFloat(valueUSD.toFixed(2) * 1000000);
            return valueUSDFixed;
          }

          const getTokenList = async () => {
            const { data: tokenList } = await axios.get(`${App.stackup.backendUrl}/v1/tokens/tokenList`);
            return tokenList;
          }

          const getWalletTokenBalances = async () => {
            const { data: balances } = await axios.get(
              `${App.stackup.backendUrl}/v1/users/${options.userId}/wallet/balances`,
              { headers: { Authorization: `Bearer ${options.accessToken}` } },
            );
            return balances;
          }
          
          const getWalletMATICBalance = async () => {
            const maticBalance = await provider.getBalance(options.walletAddress);
            const exchangeRate = await getExchangeRate(priceFeedProxies.polygon[polygonNetwork].MATIC.address);
            const convertedBalance = convertToUSDC(maticBalance, exchangeRate, 18, priceFeedProxies.polygon[polygonNetwork].MATIC.decimals);
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
            const balances = await getWalletTokenBalances();
            if (balances && balances.tokenBalances && 
              Array.isArray(balances.tokenBalances) && balances.tokenBalances.length) {
              // normalized token map for quick referencing of held token metadata
              const tokenMap = {}
              // whitelist of tokens to query for
              const tokenList = await getTokenList();
              const tokenListFiltered = tokenList.tokens.filter(token => token.chainId === parseInt(chainId));

              // utility map for populating token data
              tokenListFiltered.forEach(token => {
                tokenMap[token.address] = {
                  "chainId": token.chainId,
                  "address": token.address,
                  "name": token.name,
                  "symbol": token.symbol,
                  "decimals": token.decimals,
                  "logoURI": token.logoURI
                };
              });

              const exchangeRateMap = await getExchangeRates(tokenListFiltered);
      
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
