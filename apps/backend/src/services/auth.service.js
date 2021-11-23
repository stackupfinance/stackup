const httpStatus = require('http-status');
const tokenService = require('./token.service');
const userService = require('./user.service');
const codeService = require('./code.service');
const Token = require('../models/token.model');
const Code = require('../models/code.model');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const { types } = require('../config/codes');

/**
 * Login with username and password
 * @param {String} email
 * @param {String} password
 * @returns {Promise<User>}
 */
const loginUserWithUsernameAndPassword = async (username, password) => {
  const user = await userService.getUserByUsernameWithWallet(username);
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect username or password');
  }
  return user;
};

/**
 * Logout
 * @param {String} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await refreshTokenDoc.remove();
};

/**
 * Refresh auth tokens
 * @param {String} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await refreshTokenDoc.remove();
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Reset password
 * @param {String} username
 * @param {String} code
 * @param {String} newPassword
 * @returns {Promise}
 */
const resetPassword = async (username, code, newPassword) => {
  try {
    const user = await userService.getUserByUsername(username);
    if (!user) {
      throw new Error();
    }

    const codeDoc = await codeService.checkCode(user.id, code, types.resetPassword);
    if (!codeDoc) {
      throw new Error();
    }

    await Code.deleteMany({ user: user.id, type: types.resetPassword });
    await userService.updateUserById(user.id, { password: newPassword });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};

/**
 * Verify email
 * @param {String} userId
 * @param {String} code
 * @returns {Promise}
 */
const verifyEmail = async (userId, code) => {
  try {
    const codeDoc = await codeService.checkCode(userId, code, types.verifyEmail);
    if (!codeDoc) {
      throw new Error();
    }
    await Code.deleteMany({ user: userId, type: types.verifyEmail });
    await userService.updateUserById(userId, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  }
};

module.exports = {
  loginUserWithUsernameAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
};
