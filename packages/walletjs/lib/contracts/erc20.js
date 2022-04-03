const { ethers } = require('ethers');
const source = require('./source/ERC20.json');

module.exports.interface = new ethers.utils.Interface(source.abi);

module.exports.getInstance = (tokenAddress, provider) =>
  new ethers.Contract(tokenAddress, source.abi, provider);
