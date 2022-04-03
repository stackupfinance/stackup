const { ethers } = require('ethers');
const SingletonFactory = require('./singletonFactory');
const source =
  process.env.NODE_ENV === 'test'
    ? require('../../artifacts/contracts/ERC4337/EntryPoint.sol/EntryPoint.json')
    : require('./source/EntryPoint.json');

module.exports.deploySalt = ethers.utils.formatBytes32String(0);

module.exports.deployInitCode = new ethers.ContractFactory(
  source.abi,
  source.bytecode,
).getDeployTransaction(SingletonFactory.address).data;

module.exports.address = ethers.utils.getCreate2Address(
  SingletonFactory.address,
  this.deploySalt,
  ethers.utils.keccak256(this.deployInitCode),
);

module.exports.interface = new ethers.utils.Interface(source.abi);

module.exports.getInstance = (signerOrProvider) =>
  new ethers.Contract(this.address, source.abi, signerOrProvider);
