const activityGenerator = (address) => {
  return {
    results: [
      {
        username: address,
        wallet: {
          walletAddress: address,
        },
        id: address,
      },
    ],
    page: 1,
    limit: 20,
    totalPages: 1,
    totalResults: 1,
  };
};

module.exports = { activityGenerator };
