const httpStatus = require('http-status');
const tokenService = require('./token.service');
const userService = require('./user.service');
const codeService = require('./code.service');
const signerService = require('./signer.service');
const Token = require('../models/token.model');
const Code = require('../models/code.model');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const { types } = require('../config/codes');
const { isWalletDeployed, recoverAddressFromLoginSignature, walletContract } = require('../utils/web3');

/**
 * Login with username and signature
 * @param {String} email
 * @param {String} signature
 * @returns {Promise<User>}
 */
const loginUserWithUsernameAndSignature = async (username, signature, timestamp) => {
  const user = await userService.getUserByUsernameWithWallet(username);
  const {
    wallet: { walletAddress, initOwner },
  } = user;
  const recoveredAddress = recoverAddressFromLoginSignature(signature, timestamp);
  const owner = (await isWalletDeployed(walletAddress)) ? await walletContract(walletAddress).getOwner(0) : initOwner;

  if (!user || recoveredAddress !== owner) {
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
 * Verify email for account recovery
 * @param {String} username
 * @param {String} code
 * @param {String} userOperations
 * @returns {Promise}
 */
const recoverVerifyEmail = async (username, code, userOperations) => {
  try {
    const user = await userService.getUserByUsername(username);
    if (!user || !user.wallet) {
      throw new Error();
    }

    const codeDoc = await codeService.checkCode(user.id, code, types.recoverAccount);
    if (!codeDoc) {
      throw new Error();
    }

    await Code.deleteMany({ user: user.id, type: types.recoverAccount });
    return signerService.signUserOpAsGuardian(userOperations);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Recover account verification failed');
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
  loginUserWithUsernameAndSignature,
  logout,
  refreshAuth,
  recoverVerifyEmail,
  verifyEmail,
};
