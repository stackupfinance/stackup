const { ethers } = require("ethers");
const SingletonFactory = require("./singletonFactory");
const source = require("./source/Wallet.json");

const DEPLOY_SALT = ethers.utils.formatBytes32String(0);
const DEPLOY_INITCODE = new ethers.ContractFactory(
  source.abi,
  source.bytecode
).getDeployTransaction().data;

module.exports.address = ethers.utils.getCreate2Address(
  SingletonFactory.address,
  DEPLOY_SALT,
  ethers.utils.keccak256(DEPLOY_INITCODE)
);

module.exports.deploySalt = DEPLOY_SALT;

module.exports.deployInitCode = DEPLOY_INITCODE;
