const { ethers } = require('ethers');
const { isEnsName } = require('../utils/web3');

module.exports.isValidUsername = (username) => {
  return username.match(/^[a-zA-Z0-9_.-]*$/);
};

module.exports.isBlacklisted = (username) => {
  return username.match(/stackup|admin|support/i) || isEnsName(username);
};

module.exports.nameType = {
  GENERIC: 'generic',
  ENS: 'ens',
  STACKUP: 'stackup',
};

module.exports.getNameType = (name) => {
  if (ethers.utils.isAddress(name)) return this.nameType.GENERIC;
  if (isEnsName(name)) return this.nameType.ENS;

  return this.nameType.STACKUP;
};
