const axios = require('axios').default;
const { ethers } = require('ethers');
const { alchemy } = require('../config/config');

module.exports.getBlockNumber = async (chainId) => {
  const res = await axios.post(alchemy.appUrl, {
    jsonrpc: '2.0',
    method: 'eth_blockNumber',
    params: [],
    id: `${chainId}`,
  });

  return parseInt(res.data.result, 16);
};

module.exports.getTransactionReceipts = async (chainId, blockNumber) => {
  const res = await axios.post(alchemy.appUrl, {
    jsonrpc: '2.0',
    method: 'alchemy_getTransactionReceipts',
    params: [{ blockNumber: ethers.utils.hexValue(blockNumber) }],
    id: `${chainId}_${blockNumber}`,
  });

  return res.data;
};

module.exports.getTokenBalances = async (walletAddress, tokenAddresses) => {
  const res = await axios.post(alchemy.appUrl, {
    jsonrpc: '2.0',
    method: 'alchemy_getTokenBalances',
    params: [walletAddress, tokenAddresses],
    id: `${walletAddress}`,
  });

  return res.data;
};
