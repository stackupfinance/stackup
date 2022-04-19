const { ethers } = require("ethers");
const SingletonFactory = require("./singletonFactory");
const source = require("./source/Wallet.json");

const _deployInitCode = new ethers.ContractFactory(
  source.abi,
  source.bytecode
).getDeployTransaction().data;

const _deploySalt = ethers.utils.formatBytes32String(0);

const _address = ethers.utils.getCreate2Address(
  SingletonFactory.address,
  _deploySalt,
  ethers.utils.keccak256(_deployInitCode)
);

module.exports.deploySalt = ethers.utils.formatBytes32String(0);

module.exports.deployInitCode = _deployInitCode;

module.exports.address = _address;

module.exports.interface = new ethers.utils.Interface(source.abi);

module.exports.getInstance = (provider) =>
  new ethers.Contract(_address, source.abi, provider);
