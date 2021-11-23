const { withPaymaster, entryPointHandleOps } = require('../utils/web3');

const signUserOpWithPaymaster = async (userOperation, index) => {
  return withPaymaster(userOperation, { fee: index > 0 ? 0 : undefined });
};

const relayUserOpsToEntryPoint = async (userOperations) => {
  return entryPointHandleOps(userOperations);
};

module.exports = {
  signUserOpWithPaymaster,
  relayUserOpsToEntryPoint,
};
