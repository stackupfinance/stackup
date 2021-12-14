const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const {
  userService,
  walletService,
  transactionService,
  activityService,
  signerService,
  paymentService,
} = require('../services');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['username', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

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

const createUserWallet = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const wallet = await walletService.createWallet(userId, req.body);
  await userService.updateUserById(userId, { wallet: wallet.id });
  res.send(wallet);
});

const getUserWallet = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const wallet = await walletService.getUserWallet(userId);
  res.send(wallet);
});

const getUserSearch = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(
    { username: { $regex: req.query.username, $options: 'i' }, _id: { $ne: userId }, wallet: { $exists: true } },
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
  const options = pick(req.query, ['limit', 'page']);
  const result = await activityService.queryActivity(
    { users: userId, preview: { $ne: null } },
    { ...options, sortBy: 'updatedAt:desc' }
  );
  res.send(result);
});

const createUserActivity = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { toUserId } = req.body;
  const activity = await activityService.createActivity(userId, toUserId);
  res.send({ activity });
});

const findUserActivity = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { toUserId } = req.query;
  const activity = await activityService.findActivity(userId, toUserId);
  res.send({ activity });
});

const approveUserActivity = catchAsync(async (req, res) => {
  // TODO: Run additional verification before approving?
  const userOperations = await Promise.all(req.body.userOperations.map(signerService.signUserOpWithPaymaster));
  res.send({ userOperations });
});

const getUserActivityItems = catchAsync(async (req, res) => {
  const { userId, activityId } = req.params;
  const options = pick(req.query, ['limit', 'page']);
  const activity = await activityService.getActivityByIdAndPartialUser(activityId, userId);
  if (!activity) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Activity not found');
  }
  const activityItems = await paymentService.queryPayments(
    { activity: activity.id },
    { ...options, sortBy: 'updatedAt:desc' }
  );

  res.send({ activityItems });
});

const createUserActivityItem = catchAsync(async (req, res) => {
  const { userId, activityId } = req.params;
  const { toUser, amount, message, userOperations } = req.body;
  const activity = await activityService.getActivityByIdAndUsers(activityId, [userId, toUser]);
  if (!activity) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Activity not found');
  }
  const payment = await paymentService.createNewPayment({
    activity: activity.id,
    fromUser: userId,
    toUser,
    amount,
    message,
  });
  const activityItems = await paymentService.queryPayments(
    { activity: activity.id },
    { limit: 20, page: 1, sortBy: 'updatedAt:desc' }
  );

  transactionService.monitorNewPaymentTransaction({ paymentId: payment.id, userOperations });
  res.send({ activityItems });
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  createUserWallet,
  getUserWallet,
  getUserSearch,
  getUserActivities,
  createUserActivity,
  findUserActivity,
  approveUserActivity,
  getUserActivityItems,
  createUserActivityItem,
};
