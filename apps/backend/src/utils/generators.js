const Wallet = require('../models/wallet.model');
const { externalAddress, walletService } = require('../services');

const activityGenerator = (user) => {
  return {
    results: [
      {
        username: user.username,
        wallet: {
          walletAddress: user.wallet,
        },
        id: user._id,
      },
    ],
    page: 1,
    limit: 20,
    totalPages: 1,
    totalResults: 1,
  };
};

const userObjectGenerator = (userId, eth) => {
  return {
    username: userId,
    wallet: {
      walletAddress: eth,
      initImplementation: eth,
      initEntryPoint: eth,
      initOwner: eth,
      initGuardians: [],
      encryptedSigner: Buffer.from(eth).toString('base64'),
    },
  };
};

const toUserGenerator = (results) => {
  function changeUsername(username) {
    return `${username.slice(0, 5)}....${username.slice(-5)}`;
  }

  return results.map((result) =>
    result.toUser.username
      ? result
      : {
          ...result,
          toUser: { username: changeUsername(result.toUser.walletAddress), walletAddress: result.toUser.walletAddress },
        }
  );
};

const userAndActivitygenerator = async (address) => {
  const user = await externalAddress.createUserWithExternalAddress(address);
  const userObject = userObjectGenerator(user._id, address);
  const getExistingWallet = await Wallet.findOne({ walletAddress: address });
  if (!getExistingWallet) await walletService.createWallet(userObject.username, userObject.wallet);
  return activityGenerator(user);
};

module.exports = { activityGenerator, toUserGenerator, userAndActivitygenerator };
