const { withPaymaster } = require('../utils/web3');

const signPaymaster = async (userOperation) => {
  return withPaymaster(userOperation);
};

module.exports = {
  signPaymaster,
};
