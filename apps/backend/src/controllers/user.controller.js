const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService, walletService } = require('../services');

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
    { username: { $regex: req.query.username, $options: 'i' }, _id: { $ne: userId } },
    {
      ...options,
      projection: 'username wallet _id',
      populate: 'wallet',
      populateProjection: 'walletAddress -_id',
    }
  );
  res.send(result);
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
};
