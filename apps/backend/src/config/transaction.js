module.exports.functionSignatures = {
  walletExecuteUserOp: 'executeUserOp(address,uint256,bytes)',
  walletGrantGuardian: 'grantGuardian(address)',
  walletRevokeGuardian: 'revokeGuardian(address)',
  walletTransferOwner: 'transferOwner(address)',
  erc20Transfer: 'transfer(address,uint256)',
  erc20Approve: 'approve(address,uint256)',
};

module.exports.eventSignatures = {
  erc20Transfer: 'Transfer(address,address,uint256)',
};

module.exports.type = {
  genericRelay: 'genericRelay',
  recoverAccount: 'recoverAccount',
  newPayment: 'newPayment',
};

module.exports.status = {
  pending: 'pending',
  success: 'success',
  failed: 'failed',
};

module.exports.chainId = {
  polygon: 137,
  mumbai: 80001,
};

module.exports.erc20TokenMeta = {
  137: {
    ['0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'.toLowerCase()]: {
      units: 6,
      prefix: '$',
      tokenAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    },
  },
  80001: {
    ['0x2058A9D7613eEE744279e3856Ef0eAda5FCbaA7e'.toLowerCase()]: {
      units: 6,
      prefix: '$',
      tokenAddress: '0x2058A9D7613eEE744279e3856Ef0eAda5FCbaA7e',
    },
  },
};
