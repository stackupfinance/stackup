const httpStatus = require('http-status');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isUsernameTaken(userBody.username)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Username already taken');
  }
  return User.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {Object} [options.projection] - The projection parameter specifies which fields to return.
 * @param {String} [options.populate] - Populate data fields. Hierarchy of fields should be separated by (.). Multiple populating criteria should be separated by commas (,)
 * @param {String} [options.populateProjection] - The projection parameter specifies which fields to return for a populate.
 * @param {String} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id).populate('wallet', '-_id -user -updatedAt');
};

/**
 * Get user by username
 * @param {String} username
 * @returns {Promise<User>}
 */
const getUserByUsername = async (username) => {
  return User.findOne({ username });
};

/**
 * Get user by username and populate wallet field
 * @param {String} username
 * @returns {Promise<User>}
 */
const getUserByUsernameWithWallet = async (username) => {
  return User.findOne({ username }).populate('wallet', '-_id -user -updatedAt');
};

/**
 * Get user by username and populate wallet address only
 * @param {String} username
 * @returns {Promise<User>}
 */
const getWalletAddressByUsername = async (username) => {
  return User.findOne({ username }, 'username wallet -_id').populate('wallet', 'walletAddress initGuardians -_id');
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const { unset = [], ...update } = updateBody;
  Object.assign(user, {
    ...update,
    ...unset.reduce((prev, curr) => {
      return Object.assign(prev, { [curr]: undefined });
    }, {}),
  });

  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByUsername,
  getUserByUsernameWithWallet,
  getWalletAddressByUsername,
  updateUserById,
  deleteUserById,
};
