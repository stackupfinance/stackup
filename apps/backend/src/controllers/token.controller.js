const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const tokenList = require('../config/tokenList');
const priceFeedProxies = require('../data/chainlinkDataFeeds');
const { ethers } = require('ethers');
const { signer } = require('../utils/web3');
const { getChainId } = require('../utils/web3');

// Chainlink price feed ABI
const aggregatorV3InterfaceABI = [{ "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "description", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint80", "name": "_roundId", "type": "uint80" }], "name": "getRoundData", "outputs": [{ "internalType": "uint80", "name": "roundId", "type": "uint80" }, { "internalType": "int256", "name": "answer", "type": "int256" }, { "internalType": "uint256", "name": "startedAt", "type": "uint256" }, { "internalType": "uint256", "name": "updatedAt", "type": "uint256" }, { "internalType": "uint80", "name": "answeredInRound", "type": "uint80" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "latestRoundData", "outputs": [{ "internalType": "uint80", "name": "roundId", "type": "uint80" }, { "internalType": "int256", "name": "answer", "type": "int256" }, { "internalType": "uint256", "name": "startedAt", "type": "uint256" }, { "internalType": "uint256", "name": "updatedAt", "type": "uint256" }, { "internalType": "uint80", "name": "answeredInRound", "type": "uint80" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "version", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }];

module.exports.getTokenList = catchAsync(async (req, res) => {
  res.send(tokenList);
});

module.exports.getExchangeRates = catchAsync(async (req, res) => {
  const { tokens } = req.body;
  const chainId = await getChainId();
  // map of current exchange rates for tokens in wallet
  const exchangeRateMap = {};
  const promises = tokens.map(async (token) => {
    const tokenFeedProxyAddress = priceFeedProxies[chainId][token.symbol].address;
    const tokenFeedProxyDecimals = priceFeedProxies[chainId][token.symbol].decimals;
    const priceFeed = new ethers.Contract(tokenFeedProxyAddress, aggregatorV3InterfaceABI, signer.provider);
    const roundData = await priceFeed.latestRoundData();
    const price = roundData.answer;
    exchangeRateMap[token.symbol] = {
      price,
      decimals: tokenFeedProxyDecimals
    };
  });

  await Promise.all(promises);
  res.send(exchangeRateMap);
});

module.exports.getExchangeRate = catchAsync(async (req, res) => {
  const { tokenFeedProxyAddress } = req.params;
  const priceFeed = new ethers.Contract(tokenFeedProxyAddress, aggregatorV3InterfaceABI, signer.provider);
  const roundData = await priceFeed.latestRoundData();
  res.send(roundData.answer);
});