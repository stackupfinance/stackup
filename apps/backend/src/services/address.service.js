const userService = require('./user.service');
const { web3 } = require('../config/config');

module.exports.transformHistoryWithName = async (userWalletAddress, history) => {
  const addressMap = { [web3.paymaster]: 'paymaster', [userWalletAddress]: 'you' };

  return Promise.all(
    history.map(async (h) => {
      return {
        ...h,
        transactions: await Promise.all(
          h.transactions.map(async (tx) => {
            return {
              ...tx,
              lineItems: await Promise.all(
                tx.lineItems.map(async (li) => {
                  const fromAddress = li.from;
                  const toAddress = li.to;

                  if (!addressMap[fromAddress]) {
                    const [fromUser] = await userService.getUsersByWalletAddress([fromAddress]);
                    addressMap[fromAddress] = fromUser?.username;
                  }
                  if (!addressMap[toAddress]) {
                    const [toUser] = await userService.getUsersByWalletAddress([toAddress]);
                    addressMap[toAddress] = toUser?.username;
                  }

                  return {
                    ...li,
                    from: addressMap[fromAddress] ?? fromAddress,
                    to: addressMap[toAddress] ?? toAddress,
                    sideEffect: li.sideEffect
                      ? li.sideEffect
                          .replace(fromAddress, addressMap[fromAddress] ?? fromAddress)
                          .replace(toAddress, addressMap[toAddress] ?? toAddress)
                      : undefined,
                  };
                })
              ),
            };
          })
        ),
      };
    })
  );
};
