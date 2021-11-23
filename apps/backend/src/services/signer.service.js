const { withPaymaster } = require('../utils/web3');

const signUserOpWithPaymaster = async (userOperation) => {
  return withPaymaster(userOperation);
};

module.exports = {
  signUserOpWithPaymaster,
};
