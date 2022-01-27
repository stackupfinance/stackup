const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const {
  addressService,
  userService,
  walletService,
  transactionService,
  signerService,
  notificationService,
} = require('../services');
const { type } = require('../config/transaction');

module.exports.getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

module.exports.updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

module.exports.deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports.updateUserWallet = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const wallet = await walletService.updateUserWallet(userId, req.body);
  res.send(wallet);
});

module.exports.getUserWallet = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const wallet = await walletService.getUserWallet(userId);
  res.send(wallet);
});

module.exports.hydrateUserWalletGuardians = catchAsync(async (req, res) => {
  const { guardians } = req.body;
  res.send({ guardians: await userService.getUsersByWalletAddressAndPopulate(guardians) });
});

module.exports.getUserNotifications = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const notifications = await notificationService.getNotificationsByUserId(userId);
  res.send({ notifications });
});

module.exports.deleteUserNotification = catchAsync(async (req, res) => {
  const { userId, notificationId } = req.params;
  const notifications = await notificationService.deleteNotification(userId, notificationId);
  res.send({ notifications });
});

module.exports.getUserSearch = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(
    { username: { $regex: req.query.username, $options: 'i' }, _id: { $ne: userId }, isOnboarded: { $eq: true } },
    {
      ...options,
      projection: 'username wallet _id',
      populate: 'wallet',
      populateProjection: 'walletAddress -_id',
    }
  );
  res.send(result);
});

module.exports.getUserActivities = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const user = await userService.getUserById(userId);
  const results = await transactionService.queryActivity(user.wallet.walletAddress);

  // TODO: Implement actual pagination.
  res.send({
    results,
    page: 1,
    limit: 20,
    totalPages: 1,
    totalResults: results.length,
  });
});

module.exports.getUserActivityItems = catchAsync(async (req, res) => {
  const { userId, activityId } = req.params;
  const addresses = activityId.split('-');
  const user = await userService.getUserById(userId);
  if (!addresses.includes(user.wallet.walletAddress)) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Activity items not associated with this account');
  }

  // TODO: Implement actual pagination.
  const results = await transactionService.queryActivityItems(user, ...addresses);
  res.send({
    activityItems: {
      results,
      page: 1,
      limit: 100,
      totalPages: 1,
      totalResults: results.length,
    },
  });
});

module.exports.transactionPaymasterApproval = catchAsync(async (req, res) => {
  // TODO: Run additional verification before approving?
  const userOperations = await Promise.all(req.body.userOperations.map(signerService.signUserOpWithPaymaster));
  res.send({ userOperations });
});

module.exports.postTransaction = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { message, userOperations } = req.body;
  const user = await userService.getUserById(userId);
  const tx = await transactionService.createTransaction(
    await transactionService.parseUserOperations(userOperations),
    message
  );
  await transactionService.relayTransaction({ userId, transactionId: tx._id, userOperations });

  if (tx.type === type.newPayment) {
    const [address1, address2] = transactionService.resolveNewPaymentTransferAddresses(tx);
    res.send({
      pendingNewPayment: await transactionService
        .queryActivityItems(user, address1, address2, { limit: 1 })
        .then((r) => r[0]),
    });
  } else {
    res.status(httpStatus.NO_CONTENT).send();
  }
});

module.exports.getUserTransactionHistory = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const user = await userService.getUserById(userId);
  const results = await addressService.transformTransactionsWithName(
    user.wallet.walletAddress,
    await transactionService.queryHistory(user)
  );

  res.send({
    transactions: {
      results,
      page: 1,
      limit: 100,
      totalPages: 1,
      totalResults: results.length,
    },
  });
});
