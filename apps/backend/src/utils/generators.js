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
  return results.map((result) =>
    result.toUser.username
      ? result
      : { ...result, toUser: { username: result.toUser.walletAddress, walletAddress: result.toUser.walletAddress } }
  );
};

module.exports = { activityGenerator, toUserGenerator };
