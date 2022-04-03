const Wallet = require('../contracts/wallet');
const ERC20 = require('../contracts/erc20');

module.exports.fromUserOperation = (userOp) => {
  return Wallet.interface.parseTransaction({ data: userOp.callData });
};

module.exports.Erc20FromExecuteUserOp = (wcd) => {
  try {
    return ERC20.interface.parseTransaction({ data: wcd.args.data });
  } catch (_error) {
    return undefined;
  }
};
