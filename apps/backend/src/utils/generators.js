const { externalAddress } = require('../services');

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

const toUserGenerator = (results) => {
  function changeUsername(username) {
    return `${username.slice(0, 5)}....${username.slice(-5)}`;
  }

  return results.map((result) => {
    return {
      ...result,
      toUser: { username: changeUsername(result.toUser.walletAddress), walletAddress: result.toUser.walletAddress },
    };
  });
};

const userAndActivitygenerator = async (address) => {
  const user = await externalAddress.createUserWithExternalAddress(address);
  return activityGenerator(user);
};

module.exports = { activityGenerator, toUserGenerator, userAndActivitygenerator };
