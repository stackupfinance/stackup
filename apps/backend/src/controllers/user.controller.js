const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService, walletService, transactionService, signerService, notificationService } = require('../services');
const { type } = require('../config/transaction');

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const updateUserWallet = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const wallet = await walletService.updateUserWallet(userId, req.body);
  res.send(wallet);
});

const getUserWallet = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const wallet = await walletService.getUserWallet(userId);
  res.send(wallet);
});

const hydrateUserWalletGuardians = catchAsync(async (req, res) => {
  const { guardians } = req.body;
  res.send({ guardians: await userService.getUsersByWalletAddressAndPopulate(guardians) });
});

const getUserNotifications = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const notifications = await notificationService.getNotificationsByUserId(userId);
  res.send({ notifications });
});

const deleteUserNotification = catchAsync(async (req, res) => {
  const { userId, notificationId } = req.params;
  const notifications = await notificationService.deleteNotification(userId, notificationId);
  res.send({ notifications });
});

const getUserSearch = catchAsync(async (req, res) => {
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

const getUserActivities = catchAsync(async (req, res) => {
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

const getUserActivityItems = catchAsync(async (req, res) => {
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

const transactionPaymasterApproval = catchAsync(async (req, res) => {
  // TODO: Run additional verification before approving?
  const userOperations = await Promise.all(req.body.userOperations.map(signerService.signUserOpWithPaymaster));
  res.send({ userOperations });
});

const postTransaction = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { message, userOperations } = req.body;
  const user = await userService.getUserById(userId);
  const tx = await transactionService.createTransaction(
    await transactionService.parseUserOperations(userOperations),
    message
  );
  await transactionService.relayTransaction({ userId, transactionId: tx._id, userOperations });

  if (tx.type === type.newPayment) {
    res.send({
      pendingNewPayment: await transactionService.queryActivityItems(user, tx.from, tx.to, { limit: 1 }).then((r) => r[0]),
    });
  } else {
    res.status(httpStatus.NO_CONTENT).send();
  }
});

module.exports = {
  getUser,
  updateUser,
  deleteUser,
  updateUserWallet,
  getUserWallet,
  hydrateUserWalletGuardians,
  getUserNotifications,
  deleteUserNotification,
  getUserSearch,
  getUserActivities,
  getUserActivityItems,
  transactionPaymasterApproval,
  postTransaction,
};
