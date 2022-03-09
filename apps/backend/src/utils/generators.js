const { User } = require('../models');
const { walletService, userService } = require('../services');

const activityGenerator = (user, wallet) => {
  return {
    results: [
      {
        username: user.username,
        wallet: {
          walletAddress: wallet.walletAddress,
        },
        id: user.id,
      },
    ],
    page: 1,
    limit: 20,
    totalPages: 1,
    totalResults: 1,
  };
};

const userObjectGenerator = (ens, eth) => {
  return {
    username: ens,
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

const userGenerator = async (user, wallet) => {
  // Create a dummy user with ETH address
  const u = await User.create(user);
  const w = await walletService.createWallet(u.id, wallet);
  await userService.updateUserById(u.id, { wallet: w.id });

  return { u, w };
};

module.exports = { activityGenerator, userObjectGenerator, userGenerator };
