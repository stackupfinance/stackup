const { getChainId, getChainLinkPriceFeed } = require('../utils/web3');
const { priceFeedProxies } = require('../config/chainlink');
const tokenList = require('../config/tokenList');

module.exports.fetchSupportedTokens = async () => {
  const chainId = await getChainId();
  return tokenList.tokens.filter((token) => token.chainId === chainId && priceFeedProxies[chainId][token.symbol]);
};

module.exports.fetchAllExchangeRates = async (tokens) => {
  const chainId = await getChainId();

  const exchangeRates = await Promise.all(
    tokens.map(async (token) => {
      const tokenFeedProxyAddress = priceFeedProxies[chainId][token.symbol].address;
      const tokenFeedProxyDecimals = priceFeedProxies[chainId][token.symbol].decimals;
      const roundData = await getChainLinkPriceFeed(tokenFeedProxyAddress).latestRoundData();
      const price = roundData.answer;

      return { [token.symbol]: { price, decimals: tokenFeedProxyDecimals } };
    })
  );

  return exchangeRates.reduce((prev, curr) => ({ ...prev, ...curr }), {});
};

module.exports.fetchOneExchangeRate = async (tokenFeedProxyAddress) => {
  const roundData = await getChainLinkPriceFeed(tokenFeedProxyAddress).latestRoundData();
  return roundData.answer;
};
