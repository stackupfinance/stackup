const userService = require('./user.service');
const { web3 } = require('../config/config');
const { truncateAddress, resolveEnsName } = require('../utils/web3');

const MAX_USDC_APPROVAL =
  '$115,792,089,237,316,200,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000.00';

module.exports.addressTypes = {};

module.exports.generateSearchResultForGenericAddress = (address) => {
  return {
    results: [
      {
        username: truncateAddress(address),
        wallet: {
          walletAddress: address,
        },
      },
    ],
    page: 1,
    limit: 20,
    totalPages: 1,
    totalResults: 1,
  };
};

module.exports.generateSearchResultForEnsName = async (name) => {
  const address = await resolveEnsName(name);
  return {
    results: address
      ? [
          {
            username: truncateAddress(address),
            wallet: {
              walletAddress: address,
            },
          },
        ]
      : [],
    page: 1,
    limit: 20,
    totalPages: 1,
    totalResults: 1,
  };
};

module.exports.transformHistoryWithName = async (userWalletAddress, history) => {
  const addressMap = { [web3.paymaster]: 'stackup', [userWalletAddress]: 'you' };

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
                    from: addressMap[fromAddress] ?? truncateAddress(fromAddress),
                    to: addressMap[toAddress] ?? truncateAddress(toAddress),
                    sideEffect: li.sideEffect
                      ? li.sideEffect
                          .replace(fromAddress, addressMap[fromAddress] ?? truncateAddress(fromAddress))
                          .replace(toAddress, addressMap[toAddress] ?? truncateAddress(toAddress))
                          .replace(MAX_USDC_APPROVAL, 'the max value')
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
