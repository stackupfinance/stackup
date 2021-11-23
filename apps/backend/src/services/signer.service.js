const { PAYMASTER_ADDRESS, withPaymaster } = require('../utils/web3');

const signPaymaster = async (userOperation) => {
  return withPaymaster(PAYMASTER_ADDRESS, userOperation);
};

module.exports = {
  signPaymaster,
};
